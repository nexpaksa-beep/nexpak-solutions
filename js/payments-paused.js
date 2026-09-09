document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const completeCheckoutBtn = document.getElementById('btnCompleteCheckout');

    if (completeCheckoutBtn) {
        completeCheckoutBtn.addEventListener('click', (e) => {
            e.preventDefault();

            // 1. Validate customer form fields first
            const customerName = document.getElementById('customerName')?.value.trim();
            const customerEmail = document.getElementById('customerEmail')?.value.trim();
            const customerPhone = document.getElementById('customerPhone')?.value.trim();
            const shippingAddress = document.getElementById('shippingAddress')?.value.trim();
            const paymentMethodInput = document.querySelector('input[name="paymentMethod"]:checked');
            
            // 2. ROBUST DELIVERY GATEKEEPER CHECK (Handles both text elements and input values)
            const deliveryEl = document.getElementById('chkDelivery');
            const deliveryRawText = deliveryEl ? (deliveryEl.value || deliveryEl.textContent || '') : '';
            const deliveryText = deliveryRawText.trim().toLowerCase();

            const deliveryDigitsOnly = deliveryText.replace(/[^0-9]/g, '');
            const matchDelivery = deliveryText.match(/R\s*([0-9]+(?:\.[0-9]+)?)/i);
            const parsedDeliveryFee = matchDelivery ? parseFloat(matchDelivery[1]) : (parseFloat(deliveryText.replace(/[^0-9.]/g, '')) || 0);

            if (!deliveryEl || deliveryText === '' || deliveryDigitsOnly === '000' || deliveryDigitsOnly === '0' || (parsedDeliveryFee === 0 && !deliveryText.includes('free'))) {
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

            // 3. Handle Instant EFT vs PayFast
            if (paymentMethod === 'eft') {
                alert('Order placed successfully! Please use the Capitec bank details provided on screen to complete your EFT payment using your order number as reference.');
                localStorage.clear(); 
                window.location.href = '/index.html';
                return;
            }

            // =========================================================================
            // 4. BULLETPROOF PRICING EXTRACTION (FINANCIAL LOCK DOWN)
            // =========================================================================
            
            const cartTotal = parseFloat(localStorage.getItem('nexpak_cart_total')) || 
                              parseFloat(localStorage.getItem('nexpak_cart_subtotal')) || 0;

            if (cartTotal <= 0) {
                alert('Your order total cannot be R0.00. Please add items to your cart.');
                return;
            }

            let deliveryFee = parsedDeliveryFee;

            // Calculations
            const subtotalNet = cartTotal;
            const vatAmount = subtotalNet * 0.15; // 15% Standard SA VAT
            const absoluteGrandTotal = subtotalNet + vatAmount + deliveryFee;

            const finalPayfastAmount = Number(absoluteGrandTotal).toFixed(2);

            console.log("🔒 PURE PAYFAST PAYLOAD LOCK -> Net:", subtotalNet, " | VAT:", vatAmount, " | Delivery:", deliveryFee, " | Sent total:", finalPayfastAmount);

            
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

            const cartItems = JSON.parse(localStorage.getItem('nexpak_cart_items')) || [];
            const itemNames = cartItems.map(item => item.name).join(', ') || 'Security Hardware';
            
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
                                             
