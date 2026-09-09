document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // =========================================================================
    // 1. CONFIGURATION & DOM ELEMENTS
    // =========================================================================
    const BASE_BOOKING_FEE = 35.00;     // Base dispatch fee
    const BASE_WEIGHT_LIMIT = 2.0;       // Max weight included in base price (kg)
    const PER_KG_EXCESS_RATE = 4.50;     // Cost per kg over the base limit
    const FUEL_BUFFER_MULTIPLIER = 1.15; // 15% surcharge protection (Fuel/Tolls/VAT)

    // Estimated distance map from Benoni (km) for common areas
    const areaDistanceMap = {
        'benoni': 5, 'brakpan': 10, 'boksburg': 12, 'springs': 15, 'kempton park': 15,
        'edenvale': 22, 'germiston': 25, 'bedfordview': 28, 'johannesburg': 35, 'jhb': 35,
        'randburg': 40, 'sandton': 40, 'midrand': 45, 'centurion': 65, 'pretoria': 75, 'pta': 75
    };

    // Banking & Contact Constants
    const CAPITEC_ACC_NO = '2517857594';
    const CAPITEC_BRANCH = '470010';
    const WHATSAPP_NUMBER = '27836308249';

    // Calculator DOM Elements
    const btnCalculate = document.getElementById('btnCalculateDelivery');
    const distanceInput = document.getElementById('distance-km');
    const addressInput = document.getElementById('shippingAddress');
    const deliveryStatus = document.getElementById('deliveryStatus');
    const deliveryInfo = document.getElementById('deliveryInfo');

    // Financial Summary DOM Elements
    const subtotalEl = document.getElementById('chkSubtotal');
    const deliveryEl = document.getElementById('chkDelivery');
    const vatEl = document.getElementById('chkVat');
    const grandTotalEl = document.getElementById('chkGrandTotal');
    const itemsContainer = document.getElementById('checkoutOrderItems');
    const completeCheckoutBtn = document.getElementById('btnCompleteCheckout');

    // Payment Info & Interactive DOM Elements
    const btnCopyBank = document.getElementById('btnCopyBankDetails');
    const paymentRefDisplay = document.getElementById('payment-reference-display');
    const whatsappPopBtn = document.getElementById('btnWhatsappPop');

    // Track active delivery fee & generate unique order reference
    let activeDeliveryFee = 0;
    const generatedOrderRef = 'NEX-' + Math.floor(100000 + Math.random() * 900000);

    // Display order reference on UI
    if (paymentRefDisplay) {
        paymentRefDisplay.textContent = generatedOrderRef;
    }

    // Set dynamic WhatsApp Proof of Payment URL
    if (whatsappPopBtn) {
        const initialWaMsg = encodeURIComponent(`Hi NexPak, here is my Proof of Payment for Order ${generatedOrderRef}:`);
        whatsappPopBtn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${initialWaMsg}`;
    }

    // =========================================================================
    // 2. RETRIEVE CART DATA & COMPUTE WEIGHT
    // =========================================================================
    const cartTotal = parseFloat(localStorage.getItem('nexpak_cart_total')) || 0;
    const cartItems = JSON.parse(localStorage.getItem('nexpak_cart_items')) || [];

    function calculateTotalCartWeight() {
        let totalWeight = 0;
        cartItems.forEach(item => {
            let itemWeight = typeof item.weight === 'string' ? parseFloat(item.weight) : item.weight;
            if (!itemWeight || isNaN(itemWeight) || itemWeight <= 0) itemWeight = 0.5;
            const quantity = parseInt(item.quantity) || 1;
            totalWeight += (itemWeight * quantity);
        });
        return totalWeight;
    }

    const cartWeight = calculateTotalCartWeight();

    // =========================================================================
    // 3. FINANCIAL CALCULATIONS & SUMMARY UPDATE
    // =========================================================================
    function getPerKmRate(km) {
        if (km <= 20) return 5.50;
        if (km <= 50) return 6.50;
        return 7.50;
    }

    function updateFinancialSummary() {
        const subtotal = cartTotal;
        const vat = subtotal * 0.15; // 15% Standard SA VAT
        const grandTotal = subtotal + vat + activeDeliveryFee;

        if (subtotalEl) subtotalEl.textContent = 'R ' + subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if (deliveryEl) deliveryEl.textContent = 'R ' + activeDeliveryFee.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if (vatEl) vatEl.textContent = 'R ' + vat.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if (grandTotalEl) grandTotalEl.textContent = 'R ' + grandTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // =========================================================================
    // 4. DELIVERY COURIER CALCULATOR
    // =========================================================================
    if (btnCalculate) {
        btnCalculate.addEventListener('click', () => {
            let km = NaN;

            if (distanceInput && distanceInput.value.trim() !== '') {
                km = parseFloat(distanceInput.value);
            } else if (addressInput && addressInput.value.trim() !== '') {
                const addressText = addressInput.value.toLowerCase();
                for (const [area, estKm] of Object.entries(areaDistanceMap)) {
                    if (addressText.includes(area)) {
                        km = estKm;
                        break;
                    }
                }
                if (!isNaN(km) && distanceInput) distanceInput.value = km;
            }

            if (isNaN(km) || km < 0) {
                alert('Please enter your delivery address above or specify the distance in kilometres from Benoni.');
                return;
            }

            const perKmRate = getPerKmRate(km);
            const distanceCost = km * perKmRate;
            let weightCost = cartWeight > BASE_WEIGHT_LIMIT ? (cartWeight - BASE_WEIGHT_LIMIT) * PER_KG_EXCESS_RATE : 0;

            let subtotalFee = BASE_BOOKING_FEE + distanceCost + weightCost;
            activeDeliveryFee = km === 0 ? (BASE_BOOKING_FEE + weightCost) * FUEL_BUFFER_MULTIPLIER : subtotalFee * FUEL_BUFFER_MULTIPLIER;

            updateFinancialSummary();

            if (deliveryStatus) deliveryStatus.textContent = `${km} km / ${cartWeight.toFixed(1)} kg calculated`;
            if (deliveryInfo) deliveryInfo.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #16a34a;"></i> Delivery calculated: ${km} km (${cartWeight.toFixed(1)} kg) from Benoni.`;
        });
    }

    // Render summary cart item list
    if (itemsContainer) {
        if (cartItems.length > 0) {
            itemsContainer.innerHTML = '';
            cartItems.forEach(item => {
                const itemRow = document.createElement('div');
                itemRow.className = 'summary-row';
                itemRow.innerHTML = `
                    <span>${item.name} ${item.quantity > 1 ? `x${item.quantity}` : ''}</span>
                    <span>R ${(item.price * (item.quantity || 1)).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                `;
                itemsContainer.appendChild(itemRow);
            });
        } else {
            itemsContainer.innerHTML = `<div class="summary-row"><span>Your cart is empty</span><span>R 0.00</span></div>`;
        }
    }

    updateFinancialSummary();

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
    // 6. ORDER SUBMISSION & PAYMENT GATEWAY HANDLER
    // =========================================================================
    if (completeCheckoutBtn) {
        completeCheckoutBtn.addEventListener('click', (e) => {
            e.preventDefault();

            // Validate mandatory fields
            const customerName = document.getElementById('customerName')?.value.trim();
            const customerEmail = document.getElementById('customerEmail')?.value.trim();
            const customerPhone = document.getElementById('customerPhone')?.value.trim();
            const shippingAddress = document.getElementById('shippingAddress')?.value.trim();
            const paymentMethodInput = document.querySelector('input[name="paymentMethod"]:checked');

            // Courier fee validation
            const deliveryText = deliveryEl ? deliveryEl.textContent.trim().toLowerCase() : '';
            if (activeDeliveryFee <= 0 && !deliveryText.includes('free')) {
                alert('Please calculate your delivery charges using your address/distance before completing your order.');
                document.getElementById('btnCalculateDelivery')?.focus();
                return;
            }

            if (!customerName || !customerEmail || !customerPhone || !shippingAddress) {
                alert('Please fill in all required customer and delivery details before proceeding.');
                document.getElementById('customerName')?.focus();
                return;
            }

            const paymentMethod = paymentMethodInput ? paymentMethodInput.value : 'eft';

            // Catch attempt to use disabled PayFast option
            if (paymentMethod === 'payfast') {
                alert('PayFast card processing is currently undergoing scheduled system maintenance. Please select Capitec QR / Direct EFT to process your order immediately.');
                return;
            }

            // INSTANT EFT & CAPITEC SUCCESS FLOW
            const grandTotalText = grandTotalEl ? grandTotalEl.textContent : 'R 0.00';

            alert(
                `ORDER PLACED SUCCESSFULLY!\n\n` +
                `Order Reference: ${generatedOrderRef}\n` +
                `Total Amount: ${grandTotalText}\n\n` +
                `Please complete your Capitec QR scan or EFT transfer using reference: ${generatedOrderRef}.\n\n` +
                `Send your Proof of Payment to WhatsApp: 083 630 8249`
            );

            // Open WhatsApp directly with pre-filled message for instant customer POP transfer
            const waMessage = encodeURIComponent(`Hi NexPak, I have placed order ${generatedOrderRef} for ${grandTotalText}. Here is my Proof of Payment:`);
            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`, '_blank');

            // Clear local storage cart items
            localStorage.removeItem('nexpak_cart_count');
            localStorage.removeItem('nexpak_cart_total');
            localStorage.removeItem('nexpak_cart_subtotal');
            localStorage.removeItem('nexpak_cart_items');
            localStorage.removeItem('nexpak_cart_weight');

            // Redirect back to home or success page
            window.location.href = '/index.html';
        });
    }
});

