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

    // Global variable tracking current delivery cost state
    let activeDeliveryFee = 0;

    // =========================================================================
    // 2. RETRIEVE DATA & CALCULATE TOTAL CART WEIGHT
    // =========================================================================
    const cartTotal = parseFloat(localStorage.getItem('nexpak_cart_total')) || 0;
    const cartItems = JSON.parse(localStorage.getItem('nexpak_cart_items')) || [];

    /**
     * Loops through all cart items to extract and add up weights.
     */
    function calculateTotalCartWeight() {
        let totalWeight = 0;
        
        cartItems.forEach(item => {
            let itemWeight = item.weight;

            if (typeof itemWeight === 'string') {
                itemWeight = parseFloat(itemWeight);
            }

            if (itemWeight === undefined || itemWeight === null || isNaN(itemWeight) || itemWeight <= 0) {
                itemWeight = 0.5; 
            }

            const quantity = parseInt(item.quantity) || 1;
            totalWeight += (itemWeight * quantity);
        });
        
        return totalWeight;
    }

    const cartWeight = calculateTotalCartWeight();
    console.log("Total computed cart weight:", cartWeight, "kg");

    // =========================================================================
    // 3. CORE CALCULATION FUNCTIONS
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

        if (subtotalEl) {
            subtotalEl.textContent = 'R ' + subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        if (deliveryEl) {
            deliveryEl.textContent = 'R ' + activeDeliveryFee.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        if (vatEl) {
            vatEl.textContent = 'R ' + vat.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        if (grandTotalEl) {
            grandTotalEl.textContent = 'R ' + grandTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
    }

    // =========================================================================
    // 4. DELIVERY CALCULATOR EVENT LISTENER
    // =========================================================================
    if (btnCalculate) {
        btnCalculate.addEventListener('click', () => {
            let km = NaN;

            if (distanceInput && distanceInput.value.trim() !== '') {
                km = parseFloat(distanceInput.value);
            } 
            else if (addressInput && addressInput.value.trim() !== '') {
                const addressText = addressInput.value.toLowerCase();
                for (const [area, estKm] of Object.entries(areaDistanceMap)) {
                    if (addressText.includes(area)) {
                        km = estKm;
                        break;
                    }
                }
                if (!isNaN(km) && distanceInput) {
                    distanceInput.value = km;
                }
            }

            if (isNaN(km) || km < 0) {
                alert('Please enter your delivery address above or specify the distance in kilometres from Benoni.');
                return;
            }

            const perKmRate = getPerKmRate(km);
            const distanceCost = km * perKmRate;

            let weightCost = 0;
            if (cartWeight > BASE_WEIGHT_LIMIT) {
                weightCost = (cartWeight - BASE_WEIGHT_LIMIT) * PER_KG_EXCESS_RATE;
            }

            let subtotalFee = BASE_BOOKING_FEE + distanceCost + weightCost;
            activeDeliveryFee = subtotalFee * FUEL_BUFFER_MULTIPLIER;

            if (km === 0) {
                activeDeliveryFee = (BASE_BOOKING_FEE + weightCost) * FUEL_BUFFER_MULTIPLIER; 
            }

            updateFinancialSummary();

            if (deliveryStatus) {
                deliveryStatus.textContent = `${km} km / ${cartWeight.toFixed(1)} kg calculated`;
            }
            if (deliveryInfo) {
                deliveryInfo.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #16a34a;"></i> Delivery calculated: ${km} km (${cartWeight.toFixed(1)} kg) from Benoni.`;
            }
        });
    }

    // Populate checkout items list on load
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
            itemsContainer.innerHTML = `
                <div class="summary-row"><span>Your cart is empty</span><span>R 0.00</span></div>
            `;
        }
    }

    // Run initial financial calculation on page load
    updateFinancialSummary();

    // =========================================================================
    // 5. SECURE CHECKOUT & PAYFAST SUBMISSION HANDLER
    // =========================================================================
    if (completeCheckoutBtn) {
        completeCheckoutBtn.addEventListener('click', (e) => {
            e.preventDefault();

            // Validate form fields
            const customerName = document.getElementById('customerName')?.value.trim();
            const customerEmail = document.getElementById('customerEmail')?.value.trim();
            const customerPhone = document.getElementById('customerPhone')?.value.trim();
            const shippingAddress = document.getElementById('shippingAddress')?.value.trim();
            const paymentMethodInput = document.querySelector('input[name="paymentMethod"]:checked');
            
            // Delivery gatekeeper check
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

            const paymentMethod = paymentMethodInput ? paymentMethodInput.value : 'payfast';

            // Handle Instant EFT vs PayFast
            if (paymentMethod === 'eft') {
                alert('Order placed successfully! Please use the Capitec bank details provided on screen to complete your EFT payment using your order number as reference.');
                localStorage.clear(); 
                window.location.href = '/index.html';
                return;
            }

            // =========================================================================
            // EXACT MATHEMATICAL LOCK (Bypasses DOM comma/string bugs)
            // =========================================================================
            const subtotal = cartTotal;
            const vat = subtotal * 0.15; 
            const exactGrandTotal = subtotal + vat + activeDeliveryFee;
            const finalPayfastAmount = exactGrandTotal.toFixed(2);

            console.log("🔒 PURE PAYFAST PAYLOAD LOCK -> Exact Calculated Total Sent:", finalPayfastAmount);

            if (parseFloat(finalPayfastAmount) <= 0) {
                alert('Your order total cannot be R0.00. Please add items to your cart.');
                return;
            }

                        // =========================================================================
            // 5. SECURE CHECKOUT & PAYFAST SUBMISSION HANDLER (LIVE PRODUCTION)
            // =========================================================================
            
            // ✅ YOUR REAL LIVE CREDENTIALS GO HERE
            const payfastMerchantId = '36692313';   
            const payfastMerchantKey = 'cmvr2h6hmum6e'; 
            
            // ✅ LIVE PRODUCTION URL
            const payfastUrl = 'https://www.payfast.co.za/eng/process'; 
            
            const nameParts = customerName.split(' ');
            const firstName = nameParts[0] || 'Valued'; 
            const lastName = nameParts.slice(1).join(' ') || 'Customer';

            const itemNames = cartItems.map(item => item.name).join(', ') || 'Security Hardware & Packaging';
            let safeItemDescription = 'Nexpak Order: ' + itemNames;
            if (safeItemDescription.length > 95) {
                safeItemDescription = safeItemDescription.substring(0, 92) + '...';
            }
            
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = payfastUrl;

            const paymentData = {
                merchant_id: payfastMerchantId,
                merchant_key: payfastMerchantKey,
                return_url: window.location.origin + '/success.html', 
                cancel_url: window.location.origin + '/checkout.html', 
                name_first: firstName,
                name_last: lastName,
                email_address: customerEmail,
                cell_number: customerPhone,
                m_payment_id: 'NEX-' + Date.now(),
                amount: finalPayfastAmount,
                item_name: safeItemDescription
            };

            for (const key in paymentData) {
                if (paymentData.hasOwnProperty(key)) {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = paymentData[key];
                    form.appendChild(input);
                }
            }

            // Clear local storage cart data right before redirecting
            localStorage.removeItem('nexpak_cart_count');
            localStorage.removeItem('nexpak_cart_total');
            localStorage.removeItem('nexpak_cart_subtotal');
            localStorage.removeItem('nexpak_cart_items');
            localStorage.removeItem('nexpak_cart_weight');

            document.body.appendChild(form);
            form.submit();
        });
    }
});
                          
