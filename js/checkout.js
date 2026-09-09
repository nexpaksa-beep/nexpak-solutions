document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // =========================================================================
    // 1. CONFIGURATION CONSTANTS & DOM ELEMENTS
    // =========================================================================
    const BASE_BOOKING_FEE = 35.00;     // Base dispatch fee[span_0](start_span)[span_0](end_span)
    const BASE_WEIGHT_LIMIT = 2.0;       // Max weight included in base price (kg)[span_1](start_span)[span_1](end_span)
    const PER_KG_EXCESS_RATE = 4.50;     // Cost per kg over the base limit[span_2](start_span)[span_2](end_span)
    const FUEL_BUFFER_MULTIPLIER = 1.15; // 15% surcharge protection (Fuel/Tolls/VAT)[span_3](start_span)[span_3](end_span)

    // Distance map from Benoni (km) for automatic area lookup[span_4](start_span)[span_4](end_span)
    const areaDistanceMap = {
        'benoni': 5, 'brakpan': 10, 'boksburg': 12, 'springs': 15, 'kempton park': 15,
        'edenvale': 22, 'germiston': 25, 'bedfordview': 28, 'johannesburg': 35, 'jhb': 35,
        'randburg': 40, 'sandton': 40, 'midrand': 45, 'centurion': 65, 'pretoria': 75, 'pta': 75
    }; //[span_5](start_span)[span_5](end_span)

    // Verified Capitec Banking & WhatsApp Details
    const CAPITEC_ACC_NO = '2517857594';
    const CAPITEC_BRANCH = '470010';
    const WHATSAPP_NUMBER = '27836308249';

    // Calculator DOM Elements
    const btnCalculate = document.getElementById('btnCalculateDelivery'); //[span_6](start_span)[span_6](end_span)
    const distanceInput = document.getElementById('distance-km'); //[span_7](start_span)[span_7](end_span)
    const addressInput = document.getElementById('shippingAddress'); //[span_8](start_span)[span_8](end_span)
    const deliveryStatus = document.getElementById('deliveryStatus'); //[span_9](start_span)[span_9](end_span)
    const deliveryInfo = document.getElementById('deliveryInfo'); //[span_10](start_span)[span_10](end_span)

    // Financial Summary DOM Elements
    const subtotalEl = document.getElementById('chkSubtotal'); //[span_11](start_span)[span_11](end_span)
    const deliveryEl = document.getElementById('chkDelivery'); //[span_12](start_span)[span_12](end_span)
    const vatEl = document.getElementById('chkVat'); //[span_13](start_span)[span_13](end_span)
    const grandTotalEl = document.getElementById('chkGrandTotal'); //[span_14](start_span)[span_14](end_span)
    const itemsContainer = document.getElementById('checkoutOrderItems'); //[span_15](start_span)[span_15](end_span)
    const completeCheckoutBtn = document.getElementById('btnCompleteCheckout'); //[span_16](start_span)[span_16](end_span)

    // Interactive Payment DOM Elements
    const btnCopyBank = document.getElementById('btnCopyBankDetails');
    const paymentRefDisplay = document.getElementById('payment-reference-display');
    const whatsappPopBtn = document.getElementById('btnWhatsappPop');

    // Global delivery fee tracker and order reference generator
    let activeDeliveryFee = 0; //[span_17](start_span)[span_17](end_span)
    const generatedOrderRef = 'NEX-' + Math.floor(100000 + Math.random() * 900000);

    // Set order reference in payment card UI
    if (paymentRefDisplay) {
        paymentRefDisplay.textContent = generatedOrderRef;
    }

    // Set dynamic WhatsApp proof of payment link
    if (whatsappPopBtn) {
        const initialWaMsg = encodeURIComponent(`Hi NexPak, here is my Proof of Payment for Order ${generatedOrderRef}:`);
        whatsappPopBtn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${initialWaMsg}`;
    }

    // =========================================================================
    // 2. RETRIEVE CART DATA & CALCULATE WEIGHT
    // =========================================================================
    const cartTotal = parseFloat(localStorage.getItem('nexpak_cart_total')) || 0; //[span_18](start_span)[span_18](end_span)
    const cartItems = JSON.parse(localStorage.getItem('nexpak_cart_items')) || []; //[span_19](start_span)[span_19](end_span)

    /**
     * Loops through cart items to calculate total order weight[span_20](start_span)[span_20](end_span).
     */
    function calculateTotalCartWeight() {
        let totalWeight = 0;
        cartItems.forEach(item => {
            let itemWeight = typeof item.weight === 'string' ? parseFloat(item.weight) : item.weight; //[span_21](start_span)[span_21](end_span)
            if (!itemWeight || isNaN(itemWeight) || itemWeight <= 0) itemWeight = 0.5; //[span_22](start_span)[span_22](end_span)
            const quantity = parseInt(item.quantity) || 1; //[span_23](start_span)[span_23](end_span)
            totalWeight += (itemWeight * quantity); //[span_24](start_span)[span_24](end_span)
        });
        return totalWeight;
    }

    const cartWeight = calculateTotalCartWeight(); //[span_25](start_span)[span_25](end_span)

    // =========================================================================
    // 3. FINANCIAL CALCULATIONS & SUMMARY UPDATE
    // =========================================================================
    function getPerKmRate(km) {
        if (km <= 20) return 5.50; //[span_26](start_span)[span_26](end_span)
        if (km <= 50) return 6.50; //[span_27](start_span)[span_27](end_span)
        return 7.50; //[span_28](start_span)[span_28](end_span)
    }

    function updateFinancialSummary() {
        const subtotal = cartTotal; //[span_29](start_span)[span_29](end_span)
        const vat = subtotal * 0.15; // 15% Standard SA VAT[span_30](start_span)[span_30](end_span)
        const grandTotal = subtotal + vat + activeDeliveryFee; //[span_31](start_span)[span_31](end_span)

        if (subtotalEl) subtotalEl.textContent = 'R ' + subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); //[span_32](start_span)[span_32](end_span)
        if (deliveryEl) deliveryEl.textContent = 'R ' + activeDeliveryFee.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); //[span_33](start_span)[span_33](end_span)
        if (vatEl) vatEl.textContent = 'R ' + vat.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); //[span_34](start_span)[span_34](end_span)
        if (grandTotalEl) grandTotalEl.textContent = 'R ' + grandTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); //[span_35](start_span)[span_35](end_span)
    }

    // =========================================================================
    // 4. DELIVERY CALCULATOR EVENT LISTENER
    // =========================================================================
    if (btnCalculate) {
        btnCalculate.addEventListener('click', () => {
            let km = NaN; //[span_36](start_span)[span_36](end_span)

            if (distanceInput && distanceInput.value.trim() !== '') {
                km = parseFloat(distanceInput.value); //[span_37](start_span)[span_37](end_span)
            } else if (addressInput && addressInput.value.trim() !== '') {
                const addressText = addressInput.value.toLowerCase(); //[span_38](start_span)[span_38](end_span)
                for (const [area, estKm] of Object.entries(areaDistanceMap)) { //[span_39](start_span)[span_39](end_span)
                    if (addressText.includes(area)) { //[span_40](start_span)[span_40](end_span)
                        km = estKm; //[span_41](start_span)[span_41](end_span)
                        break;
                    }
                }
                if (!isNaN(km) && distanceInput) distanceInput.value = km; //[span_42](start_span)[span_42](end_span)
            }

            if (isNaN(km) || km < 0) {
                alert('Please enter your delivery address above or specify the distance in kilometres from Benoni.'); //[span_43](start_span)[span_43](end_span)
                return;
            }

            const perKmRate = getPerKmRate(km); //[span_44](start_span)[span_44](end_span)
            const distanceCost = km * perKmRate; //[span_45](start_span)[span_45](end_span)
            let weightCost = cartWeight > BASE_WEIGHT_LIMIT ? (cartWeight - BASE_WEIGHT_LIMIT) * PER_KG_EXCESS_RATE : 0; //[span_46](start_span)[span_46](end_span)

            let subtotalFee = BASE_BOOKING_FEE + distanceCost + weightCost; //[span_47](start_span)[span_47](end_span)
            activeDeliveryFee = km === 0 ? (BASE_BOOKING_FEE + weightCost) * FUEL_BUFFER_MULTIPLIER : subtotalFee * FUEL_BUFFER_MULTIPLIER; //[span_48](start_span)[span_48](end_span)

            updateFinancialSummary(); //[span_49](start_span)[span_49](end_span)

            if (deliveryStatus) deliveryStatus.textContent = `${km} km / ${cartWeight.toFixed(1)} kg calculated`; //[span_50](start_span)[span_50](end_span)
            if (deliveryInfo) deliveryInfo.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #16a34a;"></i> Delivery calculated: ${km} km (${cartWeight.toFixed(1)} kg) from Benoni.`; //[span_51](start_span)[span_51](end_span)
        });
    }

    // Render order items in summary block[span_52](start_span)[span_52](end_span)
    if (itemsContainer) {
        if (cartItems.length > 0) {
            itemsContainer.innerHTML = ''; //[span_53](start_span)[span_53](end_span)
            cartItems.forEach(item => {
                const itemRow = document.createElement('div'); //[span_54](start_span)[span_54](end_span)
                itemRow.className = 'summary-row'; //[span_55](start_span)[span_55](end_span)
                itemRow.innerHTML = `
                    <span>${item.name} ${item.quantity > 1 ? `x${item.quantity}` : ''}</span>
                    <span>R ${(item.price * (item.quantity || 1)).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                `; //[span_56](start_span)[span_56](end_span)
                itemsContainer.appendChild(itemRow); //[span_57](start_span)[span_57](end_span)
            });
        } else {
            itemsContainer.innerHTML = `<div class="summary-row"><span>Your cart is empty</span><span>R 0.00</span></div>`; //[span_58](start_span)[span_58](end_span)
        }
    }

    updateFinancialSummary(); //[span_59](start_span)[span_59](end_span)

    // =========================================================================
    // 5. COPY BANKING DETAILS HANDLER
    // =========================================================================
    if (btnCopyBank) {
        btnCopyBank.addEventListener('click', () => {
            const bankInfo = `Bank: Capitec Bank\nAccount Holder: NexPak Solutions (Pty) Ltd\nAccount Number: ${CAPITEC_ACC_NO}\nBranch Code: ${CAPITEC_BRANCH}\nReference: ${generatedOrderRef}`;
            
            navigator.clipboard.writeText(bankInfo).then(() => {
                const originalText = btnCopyBank.innerHTML;
                btnCopyBank.innerHTML = '<i class="fa-solid fa-check"></i> Details Copied!';
                setTimeout(() => { btnCopyBank.innerHTML = originalText; }, 2500);
            }).catch(() => {
                alert('Could not auto-copy. Please manually copy the banking details displayed on screen.');
            });
        });
    }

    // =========================================================================
    // 6. ORDER SUBMISSION HANDLER
    // =========================================================================
    if (completeCheckoutBtn) {
        completeCheckoutBtn.addEventListener('click', (e) => {
            e.preventDefault(); //[span_60](start_span)[span_60](end_span)

            // Validate mandatory input fields
            const customerName = document.getElementById('customerName')?.value.trim(); //[span_61](start_span)[span_61](end_span)
            const customerEmail = document.getElementById('customerEmail')?.value.trim(); //[span_62](start_span)[span_62](end_span)
            const customerPhone = document.getElementById('customerPhone')?.value.trim(); //[span_63](start_span)[span_63](end_span)
            const shippingAddress = document.getElementById('shippingAddress')?.value.trim(); //[span_64](start_span)[span_64](end_span)
            const paymentMethodInput = document.querySelector('input[name="paymentMethod"]:checked'); //[span_65](start_span)[span_65](end_span)

            // Validate delivery calculation gate
            const deliveryText = deliveryEl ? deliveryEl.textContent.trim().toLowerCase() : ''; //[span_66](start_span)[span_66](end_span)
            if (activeDeliveryFee <= 0 && !deliveryText.includes('free')) { //[span_67](start_span)[span_67](end_span)
                alert('Please calculate your delivery charges using your address/distance before completing your order.'); //[span_68](start_span)[span_68](end_span)
                document.getElementById('btnCalculateDelivery')?.focus(); //[span_69](start_span)[span_69](end_span)
                return;
            }

            if (!customerName || !customerEmail || !customerPhone || !shippingAddress) { //[span_70](start_span)[span_70](end_span)
                alert('Please fill in all required customer and delivery details before proceeding.'); //[span_71](start_span)[span_71](end_span)
                document.getElementById('customerName')?.focus(); //[span_72](start_span)[span_72](end_span)
                return;
            }

            const paymentMethod = paymentMethodInput ? paymentMethodInput.value : 'eft'; //[span_73](start_span)[span_73](end_span)

            // Catch attempt to select disabled PayFast option
            if (paymentMethod === 'payfast') {
                alert('PayFast card payments are currently undergoing scheduled maintenance. Please use Capitec QR / Direct EFT to process your order immediately.');
                return;
            }

            // INSTANT EFT & CAPITEC QR SUCCESS FLOW
            const grandTotalText = grandTotalEl ? grandTotalEl.textContent : 'R 0.00';

            alert(
                `ORDER PLACED SUCCESSFULLY!\n\n` +
                `Order Reference: ${generatedOrderRef}\n` +
                `Total Amount: ${grandTotalText}\n\n` +
                `Please complete your Capitec QR scan or EFT transfer using reference: ${generatedOrderRef}.\n\n` +
                `Send your Proof of Payment to WhatsApp: 083 630 8249`
            );

            // Open WhatsApp directly with pre-filled order proof message
            const waMessage = encodeURIComponent(`Hi NexPak, I have placed order ${generatedOrderRef} for ${grandTotalText}. Here is my Proof of Payment:`);
            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`, '_blank');

            // Clear local storage cart items[span_74](start_span)[span_74](end_span)
            localStorage.removeItem('nexpak_cart_count'); //[span_75](start_span)[span_75](end_span)
            localStorage.removeItem('nexpak_cart_total'); //[span_76](start_span)[span_76](end_span)
            localStorage.removeItem('nexpak_cart_subtotal'); //[span_77](start_span)[span_77](end_span)
            localStorage.removeItem('nexpak_cart_items'); //[span_78](start_span)[span_78](end_span)
            localStorage.removeItem('nexpak_cart_weight'); //[span_79](start_span)[span_79](end_span)

            // Redirect to homepage or confirmation screen[span_80](start_span)[span_80](end_span)
            window.location.href = '/index.html'; //[span_81](start_span)[span_81](end_span)
        });
    }
});

