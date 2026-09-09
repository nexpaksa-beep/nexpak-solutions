document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // =========================================================================
    // 1. CONFIGURATION & CONSTANTS
    // =========================================================================
    const BASE_BOOKING_FEE = 35.00;     // Base dispatch fee
    const BASE_WEIGHT_LIMIT = 2.0;       // Max weight included (kg)
    const PER_KG_EXCESS_RATE = 4.50;     // Cost per excess kg
    const FUEL_BUFFER_MULTIPLIER = 1.15; // 15% surcharge protection

    const areaDistanceMap = {
        'benoni': 5, 'brakpan': 10, 'boksburg': 12, 'springs': 15, 'kempton park': 15,
        'edenvale': 22, 'germiston': 25, 'bedfordview': 28, 'johannesburg': 35, 'jhb': 35,
        'randburg': 40, 'sandton': 40, 'midrand': 45, 'centurion': 65, 'pretoria': 75, 'pta': 75
    };

    const CAPITEC_ACC_NO = '2517857594';
    const CAPITEC_BRANCH = '470010';
    const WHATSAPP_NUMBER = '27836308249';

    // DOM Elements
    const btnCalculate = document.getElementById('btnCalculateDelivery');
    const distanceInput = document.getElementById('distance-km');
    const addressInput = document.getElementById('shippingAddress');
    const deliveryStatus = document.getElementById('deliveryStatus');
    const deliveryInfo = document.getElementById('deliveryInfo');

    const subtotalEl = document.getElementById('chkSubtotal');
    const deliveryEl = document.getElementById('chkDelivery');
    const deliverySummaryEl = document.getElementById('chkDeliverySummary');
    const vatEl = document.getElementById('chkVat');
    const grandTotalEl = document.getElementById('chkGrandTotal');
    const itemsContainer = document.getElementById('checkoutOrderItems');
    const completeCheckoutBtn = document.getElementById('btnCompleteCheckout');

    const btnCopyBank = document.getElementById('btnCopyBankDetails');
    const paymentRefDisplay = document.getElementById('payment-reference-display');
    const whatsappPopBtn = document.getElementById('btnWhatsappPop');

    let activeDeliveryFee = 0;
    const generatedOrderRef = 'NEX-' + Math.floor(100000 + Math.random() * 900000);

    if (paymentRefDisplay) paymentRefDisplay.textContent = generatedOrderRef;

    if (whatsappPopBtn) {
        const initialWaMsg = encodeURIComponent(`Hi NexPak, here is my Proof of Payment for Order ${generatedOrderRef}:`);
        whatsappPopBtn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${initialWaMsg}`;
    }

    // =========================================================================
    // 2. RETRIEVE CART DATA (MULTI-KEY FALLBACK)
    // =========================================================================
    function getCartItems() {
        const keys = ['nexpak_cart_items', 'cart_items', 'cartItems', 'cart'];
        for (const key of keys) {
            const data = localStorage.getItem(key);
            if (data) {
                try { return JSON.parse(data); } catch (e) { console.error(e); }
            }
        }
        return [];
    }

    function getCartSubtotal(items) {
        let total = parseFloat(localStorage.getItem('nexpak_cart_total')) || 
                    parseFloat(localStorage.getItem('cart_total')) || 0;

        if (total > 0) return total;

        // Fallback: Calculate directly from array items
        return items.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            const qty = parseInt(item.quantity) || 1;
            return sum + (price * qty);
        }, 0);
    }

    const cartItems = getCartItems();
    const cartTotal = getCartSubtotal(cartItems);

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
        const vat = subtotal * 0.15;
        const grandTotal = subtotal + vat + activeDeliveryFee;

        const formattedSubtotal = 'R ' + subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const formattedDelivery = 'R ' + activeDeliveryFee.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const formattedVat = 'R ' + vat.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const formattedGrandTotal = 'R ' + grandTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        if (subtotalEl) subtotalEl.textContent = formattedSubtotal;
        if (deliveryEl) deliveryEl.textContent = formattedDelivery;
        if (deliverySummaryEl) deliverySummaryEl.textContent = formattedDelivery;
        if (vatEl) vatEl.textContent = formattedVat;
        if (grandTotalEl) grandTotalEl.textContent = formattedGrandTotal;
    }

    // =========================================================================
    // 4. DELIVERY CALCULATOR EVENT LISTENER
    // =========================================================================
    function runDeliveryCalculation() {
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
            alert('Please enter your delivery address above or enter the estimated KM distance from Benoni.');
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
    }

    if (btnCalculate) {
        btnCalculate.addEventListener('click', runDeliveryCalculation);
    }

    // Render Cart Items
    if (itemsContainer) {
        if (cartItems.length > 0) {
            itemsContainer.innerHTML = '';
            cartItems.forEach(item => {
                const itemRow = document.createElement('div');
                itemRow.style.cssText = 'display:flex; justify-content:space-between; margin-bottom:8px; font-size:14px;';
                itemRow.innerHTML = `
                    <span>${item.name} ${item.quantity > 1 ? `x${item.quantity}` : ''}</span>
                    <span>R ${(item.price * (item.quantity || 1)).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                `;
                itemsContainer.appendChild(itemRow);
            });
        } else {
            itemsContainer.innerHTML = `<div style="display:flex; justify-content:space-between; font-size:14px;"><span>Your cart is empty</span><span>R 0.00</span></div>`;
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
    // 6. ORDER SUBMISSION HANDLER
    // =========================================================================
    if (completeCheckoutBtn) {
        completeCheckoutBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const customerName = document.getElementById('customerName')?.value.trim();
            const customerEmail = document.getElementById('customerEmail')?.value.trim();
            const customerPhone = document.getElementById('customerPhone')?.value.trim();
            const shippingAddress = document.getElementById('shippingAddress')?.value.trim();

            if (activeDeliveryFee <= 0) {
                alert('Please calculate your delivery charges using your address/distance before completing your order.');
                document.getElementById('btnCalculateDelivery')?.focus();
                return;
            }

            if (!customerName || !customerEmail || !customerPhone || !shippingAddress) {
                alert('Please fill in all required customer and delivery details before proceeding.');
                document.getElementById('customerName')?.focus();
                return;
            }

            const grandTotalText = grandTotalEl ? grandTotalEl.textContent : 'R 0.00';

            alert(
                `ORDER PLACED SUCCESSFULLY!\n\n` +
                `Order Reference: ${generatedOrderRef}\n` +
                `Total Amount: ${grandTotalText}\n\n` +
                `Please complete your Capitec QR scan or EFT transfer using reference: ${generatedOrderRef}.\n\n` +
                `Send your Proof of Payment to WhatsApp: 083 630 8249`
            );

            const waMessage = encodeURIComponent(`Hi NexPak, I have placed order ${generatedOrderRef} for ${grandTotalText}. Here is my Proof of Payment:`);
            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`, '_blank');

            localStorage.removeItem('nexpak_cart_count');
            localStorage.removeItem('nexpak_cart_total');
            localStorage.removeItem('nexpak_cart_items');
            localStorage.removeItem('cart_items');

            window.location.href = '/index.html';
        });
    }
});
                
