document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // =========================================================================
    // NEXPAK SECURITY SOLUTIONS
    // DELIVERY CALCULATOR
    // =========================================================================
    // This file is ONLY responsible for delivery calculation.
    //
    // checkout.js handles:
    // - Cart
    // - Customer details
    // - VAT
    // - Order submission
    //
    // payments.js handles:
    // - Payment method
    // - Capitec EFT / QR
    // - POP / WhatsApp
    // =========================================================================


    // =========================================================================
    // 1. CONFIGURATION
    // =========================================================================

    const BASE_BOOKING_FEE = 35.00;
    const BASE_WEIGHT_LIMIT = 2.00;
    const PER_KG_EXCESS_RATE = 4.50;
    const FUEL_BUFFER_MULTIPLIER = 1.15;

    const WAREHOUSE_LOCATION = 'Benoni';


    // =========================================================================
    // 2. ESTIMATED DISTANCES FROM BENONI
    // =========================================================================

    const areaDistanceMap = {
        'benoni': 5,
        'brakpan': 10,
        'boksburg': 12,
        'springs': 15,
        'kempton park': 15,
        'edenvale': 22,
        'germiston': 25,
        'bedfordview': 28,
        'johannesburg': 35,
        'jhb': 35,
        'randburg': 40,
        'sandton': 40,
        'midrand': 45,
        'centurion': 65,
        'pretoria': 75,
        'pta': 75
    };


    // =========================================================================
    // 3. DOM ELEMENTS
    // =========================================================================

    const btnCalculate = document.getElementById('btnCalculateDelivery');
    const distanceInput = document.getElementById('distance-km');
    const addressInput = document.getElementById('shippingAddress');

    const deliveryDisplay = document.getElementById('chkDelivery');
    const deliverySummary = document.getElementById('chkDeliverySummary');

    const deliveryStatus = document.getElementById('deliveryStatus');
    const deliveryInfo = document.getElementById('deliveryInfo');


    // =========================================================================
    // 4. GET CART ITEMS
    // =========================================================================

    function getCartItems() {

        const possibleCartKeys = [
            'nexpak_cart_items',
            'cart_items',
            'cartItems',
            'cart'
        ];

        for (const key of possibleCartKeys) {

            const storedCart = localStorage.getItem(key);

            if (!storedCart) {
                continue;
            }

            try {

                const parsedCart = JSON.parse(storedCart);

                if (Array.isArray(parsedCart)) {
                    return parsedCart;
                }

                if (parsedCart && Array.isArray(parsedCart.items)) {
                    return parsedCart.items;
                }

            } catch (error) {

                console.warn(
                    `Nexpak Delivery: Could not read cart key "${key}".`,
                    error
                );

            }
        }

        return [];
    }


    // =========================================================================
    // 5. CALCULATE ACTUAL CART WEIGHT
    // =========================================================================

    function getCartWeight() {

        const cartItems = getCartItems();

        if (!cartItems.length) {
            return 0;
        }

        let totalWeight = 0;

        cartItems.forEach(item => {

            let weight = parseFloat(item.weight);

            /*
             * If a product does not have a weight recorded,
             * use a conservative default of 0.5kg.
             */
            if (!Number.isFinite(weight) || weight <= 0) {
                weight = 0.5;
            }

            let quantity = parseInt(item.quantity, 10);

            if (!Number.isFinite(quantity) || quantity < 1) {
                quantity = 1;
            }

            totalWeight += weight * quantity;

        });

        return totalWeight;
    }


    // =========================================================================
    // 6. DISTANCE RATE
    // =========================================================================

    function getPerKmRate(km) {

        if (km <= 20) {
            return 5.50;
        }

        if (km <= 50) {
            return 6.50;
        }

        return 7.50;
    }


    // =========================================================================
    // 7. FIND DISTANCE FROM ADDRESS
    // =========================================================================

    function detectDistanceFromAddress(address) {

        if (!address) {
            return null;
        }

        const addressText = address.toLowerCase();

        for (const [area, distance] of Object.entries(areaDistanceMap)) {

            if (addressText.includes(area)) {
                return distance;
            }

        }

        return null;
    }


    // =========================================================================
    // 8. CALCULATE DELIVERY FEE
    // =========================================================================

    function calculateDeliveryFee(km, cartWeight) {

        const distance = Number(km);
        const weight = Number(cartWeight);

        if (!Number.isFinite(distance) || distance < 0) {
            return 0;
        }

        const safeWeight =
            Number.isFinite(weight) && weight >= 0
                ? weight
                : 0;


        // Distance charge
        const perKmRate = getPerKmRate(distance);

        const distanceCost = distance * perKmRate;


        // Excess weight charge
        let weightCost = 0;

        if (safeWeight > BASE_WEIGHT_LIMIT) {

            const excessWeight =
                safeWeight - BASE_WEIGHT_LIMIT;

            weightCost =
                excessWeight * PER_KG_EXCESS_RATE;

        }


        // Base delivery cost
        const subtotalFee =
            BASE_BOOKING_FEE +
            distanceCost +
            weightCost;


        // Fuel / operating buffer
        let finalFee =
            subtotalFee * FUEL_BUFFER_MULTIPLIER;


        // Local / same-location safety calculation
        if (distance === 0) {

            finalFee =
                (BASE_BOOKING_FEE + weightCost) *
                FUEL_BUFFER_MULTIPLIER;

        }


        // Round to cents
        finalFee =
            Math.round(finalFee * 100) / 100;


        return finalFee;
    }


    // =========================================================================
    // 9. FORMAT CURRENCY
    // =========================================================================

    function formatCurrency(amount) {

        return 'R ' + Number(amount).toLocaleString(
            'en-ZA',
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

    }


    // =========================================================================
    // 10. UPDATE DELIVERY DISPLAY
    // =========================================================================

    function updateDeliveryDisplay(fee, km, weight) {

        const formattedFee = formatCurrency(fee);


        if (deliveryDisplay) {
            deliveryDisplay.textContent = formattedFee;
        }


        if (deliverySummary) {
            deliverySummary.textContent = formattedFee;
        }


        if (deliveryStatus) {

            deliveryStatus.textContent =
                `${km} km / ${weight.toFixed(1)} kg calculated`;

        }


        if (deliveryInfo) {

            deliveryInfo.innerHTML = `
                <i class="fa-solid fa-circle-check" style="color:#16a34a;"></i>
                Delivery calculated from ${WAREHOUSE_LOCATION}:
                ${km} km / ${weight.toFixed(1)} kg.
                Delivery fee: <strong>${formattedFee}</strong>
            `;

        }

    }


    // =========================================================================
    // 11. SAVE DELIVERY DATA
    // =========================================================================
    // checkout.js can retrieve these values without recalculating delivery.
    // =========================================================================

    function saveDeliveryData(km, weight, fee) {

        localStorage.setItem(
            'nexpak_delivery_km',
            String(km)
        );

        localStorage.setItem(
            'nexpak_delivery_weight',
            String(weight)
        );

        localStorage.setItem(
            'nexpak_delivery_fee',
            String(fee)
        );

    }


    // =========================================================================
    // 12. CLEAR DELIVERY DATA
    // =========================================================================

    function clearDeliveryData() {

        localStorage.removeItem('nexpak_delivery_km');
        localStorage.removeItem('nexpak_delivery_weight');
        localStorage.removeItem('nexpak_delivery_fee');

    }


    // =========================================================================
    // 13. MAIN DELIVERY CALCULATION
    // =========================================================================

    function runDeliveryCalculation() {

        let km = NaN;


        // -------------------------------------------------------------
        // OPTION 1 — USER ENTERED KM
        // -------------------------------------------------------------

        if (
            distanceInput &&
            distanceInput.value.trim() !== ''
        ) {

            km = parseFloat(
                distanceInput.value
            );

        }


        // -------------------------------------------------------------
        // OPTION 2 — DETECT DISTANCE FROM ADDRESS
        // -------------------------------------------------------------

        else if (
            addressInput &&
            addressInput.value.trim() !== ''
        ) {

            const detectedDistance =
                detectDistanceFromAddress(
                    addressInput.value
                );

            if (detectedDistance !== null) {

                km = detectedDistance;

                if (distanceInput) {

                    distanceInput.value =
                        detectedDistance;

                }

            }

        }


        // -------------------------------------------------------------
        // VALIDATION
        // -------------------------------------------------------------

        if (
            !Number.isFinite(km) ||
            km < 0
        ) {

            clearDeliveryData();

            alert(
                'Please enter your delivery address or enter the estimated distance in kilometres from Benoni.'
            );

            return false;

        }


        // -------------------------------------------------------------
        // GET ACTUAL CART WEIGHT
        // -------------------------------------------------------------

        const cartWeight =
            getCartWeight();


        // -------------------------------------------------------------
        // CALCULATE DELIVERY
        // -------------------------------------------------------------

        const deliveryFee =
            calculateDeliveryFee(
                km,
                cartWeight
            );


        // -------------------------------------------------------------
        // UPDATE PAGE
        // -------------------------------------------------------------

        updateDeliveryDisplay(
            deliveryFee,
            km,
            cartWeight
        );


        // -------------------------------------------------------------
        // SAVE FOR CHECKOUT.JS
        // -------------------------------------------------------------

        saveDeliveryData(
            km,
            cartWeight,
            deliveryFee
        );


        // -------------------------------------------------------------
        // OPTIONAL GLOBAL ACCESS
        // -------------------------------------------------------------
        // This allows checkout.js to read the current delivery fee
        // without duplicating the calculation.

        window.NexpakDelivery = {

            fee: deliveryFee,

            km: km,

            weight: cartWeight,

            formattedFee: formatCurrency(
                deliveryFee
            )

        };


        return true;

    }


    // =========================================================================
    // 14. BUTTON EVENT
    // =========================================================================

    if (btnCalculate) {

        btnCalculate.addEventListener(
            'click',
            runDeliveryCalculation
        );

    }


    // =========================================================================
    // 15. ADDRESS CHANGE
    // =========================================================================

    if (addressInput) {

        addressInput.addEventListener(
            'input',
            () => {

                /*
                 * Do not automatically charge the customer.
                 * Clear the previous delivery calculation so
                 * the customer must recalculate after changing
                 * their address.
                 */

                clearDeliveryData();

            }
        );

    }


    // =========================================================================
    // 16. DISTANCE CHANGE
    // =========================================================================

    if (distanceInput) {

        distanceInput.addEventListener(
            'input',
            () => {

                clearDeliveryData();

            }
        );

    }


    // =========================================================================
    // 17. PUBLIC API
    // =========================================================================

    window.NexpakDeliveryCalculator = {

        calculate: runDeliveryCalculation,

        getFee: () => {

            return parseFloat(
                localStorage.getItem(
                    'nexpak_delivery_fee'
                )
            ) || 0;

        },

        getDistance: () => {

            return parseFloat(
                localStorage.getItem(
                    'nexpak_delivery_km'
                )
            ) || 0;

        },

        getWeight: () => {

            return parseFloat(
                localStorage.getItem(
                    'nexpak_delivery_weight'
                )
            ) || 0;

        },

        getPerKmRate: getPerKmRate,

        getCartWeight: getCartWeight,

        formatCurrency: formatCurrency

    };


    // =========================================================================
    // 18. INITIAL STATE
    // =========================================================================

    /*
     * We intentionally do NOT calculate delivery automatically.
     * The customer must enter/confirm their address and click
     * "Calculate Delivery".
     */

    console.log(
        'Nexpak Delivery Calculator loaded successfully.'
    );

});
