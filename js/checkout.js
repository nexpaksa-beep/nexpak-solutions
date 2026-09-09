document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // =========================================================================
    // NEXPAK SECURITY SOLUTIONS
    // CHECKOUT CONTROLLER
    // =========================================================================
    // This file handles:
    // - Cart retrieval
    // - Cart display
    // - Customer details
    // - VAT
    // - Order totals
    // - Order reference
    // - Order submission
    // - WhatsApp POP hand-off
    //
    // DELIVERY CALCULATIONS ARE HANDLED BY:
    // delivery-calculator.js
    //
    // PAYMENT UI IS HANDLED BY:
    // payments.js
    // =========================================================================


    // =========================================================================
    // 1. CONFIGURATION
    // =========================================================================

    const VAT_RATE = 0.15;

    const WHATSAPP_NUMBER = '27836308249';

    const HOME_PAGE = 'index.html';


    // =========================================================================
    // 2. DOM ELEMENTS
    // =========================================================================

    const subtotalEl =
        document.getElementById('chkSubtotal');

    const deliveryEl =
        document.getElementById('chkDelivery');

    const deliverySummaryEl =
        document.getElementById('chkDeliverySummary');

    const vatEl =
        document.getElementById('chkVat');

    const grandTotalEl =
        document.getElementById('chkGrandTotal');

    const itemsContainer =
        document.getElementById('checkoutOrderItems');

    const completeCheckoutBtn =
        document.getElementById('btnCompleteCheckout');

    const paymentRefDisplay =
        document.getElementById('payment-reference-display');

    const whatsappPopBtn =
        document.getElementById('btnWhatsappPop');


    // =========================================================================
    // 3. GENERATE ORDER REFERENCE
    // =========================================================================

    const generatedOrderRef =
        'NEX-' +
        Math.floor(
            100000 +
            Math.random() * 900000
        );


    // Display payment reference
    if (paymentRefDisplay) {

        paymentRefDisplay.textContent =
            generatedOrderRef;

    }


    // =========================================================================
    // 4. CART STORAGE KEYS
    // =========================================================================

    const CART_ITEM_KEYS = [
        'nexpak_cart_items',
        'cart_items',
        'cartItems',
        'cart'
    ];

    const CART_TOTAL_KEYS = [
        'nexpak_cart_total',
        'cart_total',
        'cartTotal',
        'cartSubtotal'
    ];


    // =========================================================================
    // 5. GET CART ITEMS
    // =========================================================================

    function getCartItems() {

        for (const key of CART_ITEM_KEYS) {

            const storedCart =
                localStorage.getItem(key);

            if (!storedCart) {
                continue;
            }

            try {

                const parsedCart =
                    JSON.parse(storedCart);

                if (Array.isArray(parsedCart)) {

                    return parsedCart;

                }

                if (
                    parsedCart &&
                    Array.isArray(parsedCart.items)
                ) {

                    return parsedCart.items;

                }

            } catch (error) {

                console.warn(
                    `Nexpak Checkout: Unable to parse ${key}`,
                    error
                );

            }

        }

        return [];

    }


    // =========================================================================
    // 6. GET CART SUBTOTAL
    // =========================================================================

    function getCartSubtotal(items) {

        // -------------------------------------------------------------
        // First try stored cart totals
        // -------------------------------------------------------------

        for (const key of CART_TOTAL_KEYS) {

            const storedTotal =
                parseFloat(
                    localStorage.getItem(key)
                );

            if (
                Number.isFinite(storedTotal) &&
                storedTotal > 0
            ) {

                return storedTotal;

            }

        }


        // -------------------------------------------------------------
        // Fallback: calculate from cart items
        // -------------------------------------------------------------

        return items.reduce(
            (total, item) => {

                const price =
                    parseFloat(item.price) || 0;

                const quantity =
                    parseInt(
                        item.quantity,
                        10
                    ) || 1;

                return total +
                    (price * quantity);

            },
            0
        );

    }


    // =========================================================================
    // 7. LOAD CART
    // =========================================================================

    const cartItems =
        getCartItems();

    const cartSubtotal =
        getCartSubtotal(cartItems);


    // =========================================================================
    // 8. FORMAT CURRENCY
    // =========================================================================

    function formatCurrency(amount) {

        return 'R ' +
            Number(amount).toLocaleString(
                'en-ZA',
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );

    }


    // =========================================================================
    // 9. GET CURRENT DELIVERY FEE
    // =========================================================================
    // delivery-calculator.js stores the calculated amount here.
    // =========================================================================

    function getDeliveryFee() {

        if (
            window.NexpakDelivery &&
            Number.isFinite(
                Number(window.NexpakDelivery.fee)
            )
        ) {

            return Number(
                window.NexpakDelivery.fee
            );

        }


        const storedFee =
            parseFloat(
                localStorage.getItem(
                    'nexpak_delivery_fee'
                )
            );


        if (
            Number.isFinite(storedFee) &&
            storedFee >= 0
        ) {

            return storedFee;

        }


        return 0;

    }


    // =========================================================================
    // 10. CALCULATE TOTALS
    // =========================================================================

    function calculateTotals() {

        const deliveryFee =
            getDeliveryFee();

        const vat =
            cartSubtotal * VAT_RATE;

        const grandTotal =
            cartSubtotal +
            vat +
            deliveryFee;

        return {
            subtotal: cartSubtotal,
            delivery: deliveryFee,
            vat: vat,
            grandTotal: grandTotal
        };

    }


    // =========================================================================
    // 11. UPDATE FINANCIAL SUMMARY
    // =========================================================================

    function updateFinancialSummary() {

        const totals =
            calculateTotals();


        if (subtotalEl) {

            subtotalEl.textContent =
                formatCurrency(
                    totals.subtotal
                );

        }


        if (deliveryEl) {

            deliveryEl.textContent =
                formatCurrency(
                    totals.delivery
                );

        }


        if (deliverySummaryEl) {

            deliverySummaryEl.textContent =
                formatCurrency(
                    totals.delivery
                );

        }


        if (vatEl) {

            vatEl.textContent =
                formatCurrency(
                    totals.vat
                );

        }


        if (grandTotalEl) {

            grandTotalEl.textContent =
                formatCurrency(
                    totals.grandTotal
                );

        }

    }


    // =========================================================================
    // 12. RENDER CART ITEMS
    // =========================================================================

    function renderCartItems() {

        if (!itemsContainer) {
            return;
        }


        itemsContainer.innerHTML = '';


        if (!cartItems.length) {

            itemsContainer.innerHTML = `
                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        font-size:14px;
                    "
                >
                    <span>Your cart is empty</span>
                    <span>R 0.00</span>
                </div>
            `;

            return;

        }


        cartItems.forEach(item => {

            const itemRow =
                document.createElement('div');


            itemRow.style.cssText = `
                display:flex;
                justify-content:space-between;
                align-items:center;
                gap:15px;
                margin-bottom:8px;
                font-size:14px;
            `;


            const name =
                item.name ||
                item.title ||
                'Security Product';


            const price =
                parseFloat(item.price) || 0;


            const quantity =
                parseInt(
                    item.quantity,
                    10
                ) || 1;


            const lineTotal =
                price * quantity;


            itemRow.innerHTML = `
                <span>
                    ${escapeHtml(name)}
                    ${quantity > 1 ? ` x${quantity}` : ''}
                </span>

                <span>
                    ${formatCurrency(lineTotal)}
                </span>
            `;


            itemsContainer.appendChild(
                itemRow
            );

        });

    }


    // =========================================================================
    // 13. HTML SAFETY HELPER
    // =========================================================================

    function escapeHtml(value) {

        const div =
            document.createElement('div');

        div.textContent =
            String(value);

        return div.innerHTML;

    }


    // =========================================================================
    // 14. CUSTOMER DETAILS
    // =========================================================================

    function getCustomerDetails() {

        const name =
            document.getElementById(
                'customerName'
            )?.value.trim() || '';


        const email =
            document.getElementById(
                'customerEmail'
            )?.value.trim() || '';


        const phone =
            document.getElementById(
                'customerPhone'
            )?.value.trim() || '';


        const address =
            document.getElementById(
                'shippingAddress'
            )?.value.trim() || '';


        return {
            name,
            email,
            phone,
            address
        };

    }


    // =========================================================================
    // 15. VALIDATE CUSTOMER DETAILS
    // =========================================================================

    function validateCustomerDetails() {

        const customer =
            getCustomerDetails();


        if (!customer.name) {

            alert(
                'Please enter your full name.'
            );

            document.getElementById(
                'customerName'
            )?.focus();

            return false;

        }


        if (!customer.email) {

            alert(
                'Please enter your email address.'
            );

            document.getElementById(
                'customerEmail'
            )?.focus();

            return false;

        }


        // Basic email validation
        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (
            !emailPattern.test(
                customer.email
            )
        ) {

            alert(
                'Please enter a valid email address.'
            );

            document.getElementById(
                'customerEmail'
            )?.focus();

            return false;

        }


        if (!customer.phone) {

            alert(
                'Please enter your phone number.'
            );

            document.getElementById(
                'customerPhone'
            )?.focus();

            return false;

        }


        if (!customer.address) {

            alert(
                'Please enter your delivery address.'
            );

            document.getElementById(
                'shippingAddress'
            )?.focus();

            return false;

        }


        return true;

    }


    // =========================================================================
    // 16. VALIDATE DELIVERY
    // =========================================================================

    function validateDelivery() {

        const deliveryFee =
            getDeliveryFee();


        if (
            !Number.isFinite(deliveryFee) ||
            deliveryFee <= 0
        ) {

            alert(
                'Please calculate your delivery charges before completing your order.'
            );


            document.getElementById(
                'btnCalculateDelivery'
            )?.focus();


            return false;

        }


        return true;

    }


    // =========================================================================
    // 17. SAVE ORDER RECORD
    // =========================================================================
    // A copy of the order is stored locally before the cart is cleared.
    // This is useful for future order confirmation / admin integration.
    // =========================================================================

    function saveOrderRecord(
        customer,
        totals
    ) {

        const order = {

            orderReference:
                generatedOrderRef,

            date:
                new Date().toISOString(),

            status:
                'Payment Pending',

            paymentMethod:
                'Capitec QR / EFT',

            customer: {
                name:
                    customer.name,

                email:
                    customer.email,

                phone:
                    customer.phone,

                shippingAddress:
                    customer.address
            },

            items:
                cartItems,

            totals: {

                subtotal:
                    totals.subtotal,

                delivery:
                    totals.delivery,

                vat:
                    totals.vat,

                grandTotal:
                    totals.grandTotal

            }

        };


        localStorage.setItem(
            'nexpak_last_order',
            JSON.stringify(order)
        );


        return order;

    }


    // =========================================================================
    // 18. WHATSAPP POP LINK
    // =========================================================================

    function updateWhatsAppPopLink() {

        if (!whatsappPopBtn) {
            return;
        }


        const message =
            encodeURIComponent(
                `Hi NexPak, here is my Proof of Payment for Order ${generatedOrderRef}.`
            );


        whatsappPopBtn.href =
            `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

    }


    // =========================================================================
    // 19. COMPLETE ORDER
    // =========================================================================

    function completeOrder(event) {

        if (event) {
            event.preventDefault();
        }


        // -------------------------------------------------------------
        // CART VALIDATION
        // -------------------------------------------------------------

        if (!cartItems.length) {

            alert(
                'Your cart is empty. Please add products before checking out.'
            );

            return;

        }


        // -------------------------------------------------------------
        // CUSTOMER VALIDATION
        // -------------------------------------------------------------

        if (
            !validateCustomerDetails()
        ) {

            return;

        }


        // -------------------------------------------------------------
        // DELIVERY VALIDATION
        // -------------------------------------------------------------

        if (
            !validateDelivery()
        ) {

            return;

        }


        // -------------------------------------------------------------
        // CALCULATE FINAL TOTALS
        // -------------------------------------------------------------

        const customer =
            getCustomerDetails();


        const totals =
            calculateTotals();


        const grandTotalText =
            formatCurrency(
                totals.grandTotal
            );


        // -------------------------------------------------------------
        // SAVE ORDER BEFORE CLEARING CART
        // -------------------------------------------------------------

        saveOrderRecord(
            customer,
            totals
        );


        // -------------------------------------------------------------
        // CUSTOMER CONFIRMATION
        // -------------------------------------------------------------

        const confirmed =
            confirm(
                `ORDER ${generatedOrderRef}\n\n` +

                `Order Total: ${grandTotalText}\n\n` +

                `Payment Method: Capitec QR / EFT\n\n` +

                `Please complete your payment using reference:\n` +

                `${generatedOrderRef}\n\n` +

                `After payment, send your Proof of Payment to WhatsApp 083 630 8249.\n\n` +

                `Click OK to continue to WhatsApp.`
            );


        if (!confirmed) {

            return;

        }


        // -------------------------------------------------------------
        // OPEN WHATSAPP
        // -------------------------------------------------------------

        const waMessage =
            encodeURIComponent(

                `Hi NexPak,\n\n` +

                `I have placed order ${generatedOrderRef}.\n` +

                `Order Total: ${grandTotalText}\n\n` +

                `Customer: ${customer.name}\n` +

                `Phone: ${customer.phone}\n\n` +

                `Here is my Proof of Payment.`

            );


        window.open(
            `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`,
            '_blank'
        );


        // -------------------------------------------------------------
        // CLEAR CART
        // -------------------------------------------------------------

        clearCart();


                // -------------------------------------------------------------
        // CLEAR CART
        // -------------------------------------------------------------

        clearCart();


        // -------------------------------------------------------------
        // CLEAR DELIVERY DATA
        // -------------------------------------------------------------

        clearDeliveryData();


        // -------------------------------------------------------------
        // UPDATE CART BADGE
        // -------------------------------------------------------------

        updateCartBadge();


        // -------------------------------------------------------------
        // RETURN TO HOME PAGE
        // -------------------------------------------------------------

        setTimeout(() => {

            window.location.href = HOME_PAGE;

        }, 500);

    }


    // =========================================================================
    // 20. CLEAR CART
    // =========================================================================

    function clearCart() {

        const keysToRemove = [
            'nexpak_cart_count',
            'nexpak_cart_total',
            'nexpak_cart_items',
            'cart_items',
            'cartItems',
            'cart',
            'cart_total',
            'cartTotal',
            'cartSubtotal'
        ];

        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });

    }


    // =========================================================================
    // 21. CLEAR DELIVERY DATA
    // =========================================================================

    function clearDeliveryData() {

        localStorage.removeItem('nexpak_delivery_km');
        localStorage.removeItem('nexpak_delivery_weight');
        localStorage.removeItem('nexpak_delivery_fee');

    }


    // =========================================================================
    // 22. UPDATE CART BADGE
    // =========================================================================

    function updateCartBadge() {

        const possibleBadges = [
            'cart-count',
            'cartCount',
            'nexpak-cart-count',
            'nexpak_cart_count'
        ];

        possibleBadges.forEach(id => {

            const badge = document.getElementById(id);

            if (badge) {
                badge.textContent = '0';
            }

        });

    }


    // =========================================================================
    // 23. COMPLETE CHECKOUT BUTTON
    // =========================================================================
    // IMPORTANT:
    // checkout.js is the ONLY file that handles this button.
    // payments.js must NOT attach another checkout handler.
    // =========================================================================

    if (completeCheckoutBtn) {

        completeCheckoutBtn.addEventListener(
            'click',
            completeOrder
        );

    }


    // =========================================================================
    // 24. REFRESH TOTALS AFTER DELIVERY CALCULATION
    // =========================================================================

    const calculateDeliveryBtn =
        document.getElementById('btnCalculateDelivery');

    if (calculateDeliveryBtn) {

        calculateDeliveryBtn.addEventListener(
            'click',
            () => {

                // Give delivery-calculator.js time to
                // save the calculated delivery fee.

                setTimeout(() => {

                    updateFinancialSummary();

                }, 50);

            }
        );

    }


    // =========================================================================
    // 25. INITIALISE CHECKOUT
    // =========================================================================

    renderCartItems();

    updateFinancialSummary();

    updateWhatsAppPopLink();


    // =========================================================================
    // 26. PUBLIC CHECKOUT API
    // =========================================================================

    window.NexpakCheckout = {

        getCartItems: () => {
            return getCartItems();
        },

        getSubtotal: () => {
            return cartSubtotal;
        },

        getDeliveryFee: () => {
            return getDeliveryFee();
        },

        getTotals: () => {
            return calculateTotals();
        },

        getOrderReference: () => {
            return generatedOrderRef;
        },

        updateSummary: () => {
            updateFinancialSummary();
        },

        completeOrder: () => {
            completeOrder();
        }

    };


    // =========================================================================
    // 27. READY
    // =========================================================================

    console.log(
        'Nexpak Checkout Controller loaded successfully.'
    );

});
