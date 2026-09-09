/* =========================================================
   NEXPAK SECURITY SOLUTIONS
   KT COURIERS DELIVERY CALCULATOR
   =========================================================

   DELIVERY PROVIDER:
   KT Couriers

   ECONOMY:
   Small  = R89
   Medium = R129
   Large  = R179
   ETA    = 3–4 days

   STANDARD:
   Small  = R129
   Medium = R179
   Large  = R239
   ETA    = 1–2 days

   EXPRESS:
   R4.50 per KM
   ETA = Same Day

   IMPORTANT:
   This file handles DELIVERY ONLY.
   It does NOT handle:
   - Checkout submission
   - Payments
   - WhatsApp orders
   - Cart clearing

   ========================================================= */

(function () {

    "use strict";

    /* =====================================================
       KT COURIERS CONFIGURATION
    ===================================================== */

    const KT_RATES = {

        economy: {
            name: "Economy",
            description: "3–4 business days",
            small: 89,
            medium: 129,
            large: 179
        },

        standard: {
            name: "Standard",
            description: "1–2 business days",
            small: 129,
            medium: 179,
            large: 239
        },

        express: {
            name: "Express",
            description: "Same-day delivery",
            perKm: 4.50
        }

    };


    /* =====================================================
       STORAGE KEYS
    ===================================================== */

    const STORAGE = {

        method: "nexpak_delivery_method",
        size: "nexpak_delivery_size",
        km: "nexpak_delivery_km",
        fee: "nexpak_delivery_fee",
        eta: "nexpak_delivery_eta"

    };


    /* =====================================================
       CART HELPERS
    ===================================================== */

    function getCart() {

        const possibleKeys = [
            "nexpak_cart_items",
            "cart_items",
            "cartItems",
            "cart"
        ];

        for (const key of possibleKeys) {

            try {

                const stored = localStorage.getItem(key);

                if (!stored) continue;

                const parsed = JSON.parse(stored);

                if (Array.isArray(parsed)) {
                    return parsed;
                }

                if (parsed && Array.isArray(parsed.items)) {
                    return parsed.items;
                }

            } catch (error) {

                console.warn(
                    "[Nexpak Delivery] Could not read cart:",
                    key,
                    error
                );

            }

        }

        return [];

    }


    /* =====================================================
       ELEMENT HELPERS
    ===================================================== */

    function getElement(id) {
        return document.getElementById(id);
    }


    function money(value) {

        return "R" + Number(value || 0).toFixed(2);

    }


    /* =====================================================
       DELIVERY METHOD
    ===================================================== */

    function getSelectedMethod() {

        const select = getElement("deliveryMethod");

        if (select) {

            return String(select.value || "standard").toLowerCase();

        }


        const checked = document.querySelector(
            'input[name="deliveryMethod"]:checked'
        );

        if (checked) {

            return String(
                checked.value || "standard"
            ).toLowerCase();

        }


        return localStorage.getItem(STORAGE.method) || "standard";

    }


    /* =====================================================
       PARCEL SIZE
    ===================================================== */

    function getSelectedSize() {

        const select = getElement("parcelSize");

        if (select) {

            return String(select.value || "medium").toLowerCase();

        }


        const checked = document.querySelector(
            'input[name="parcelSize"]:checked'
        );

        if (checked) {

            return String(
                checked.value || "medium"
            ).toLowerCase();

        }


        return localStorage.getItem(STORAGE.size) || "medium";

    }


    /* =====================================================
       DISTANCE
    ===================================================== */

    function getDistance() {

        const distanceField = getElement("distance-km");

        if (!distanceField) {
            return 0;
        }

        const distance = parseFloat(
            String(distanceField.value || "")
                .replace(",", ".")
                .replace(/[^\d.]/g, "")
        );

        return Number.isFinite(distance) && distance > 0
            ? distance
            : 0;

    }


    /* =====================================================
       DELIVERY CALCULATION
    ===================================================== */

    function calculateDelivery() {

        const method = getSelectedMethod();
        const size = getSelectedSize();
        const km = getDistance();


        /* -------------------------------------------------
           ECONOMY
        ------------------------------------------------- */

        if (method === "economy") {

            const rate = KT_RATES.economy[size];

            if (!rate) {

                return {
                    success: false,
                    message: "Please select a valid parcel size."
                };

            }

            return {

                success: true,

                method: "economy",

                methodName: "Economy",

                size: size,

                km: 0,

                fee: rate,

                eta: "3–4 business days"

            };

        }


        /* -------------------------------------------------
           STANDARD
        ------------------------------------------------- */

        if (method === "standard") {

            const rate = KT_RATES.standard[size];

            if (!rate) {

                return {
                    success: false,
                    message: "Please select a valid parcel size."
                };

            }

            return {

                success: true,

                method: "standard",

                methodName: "Standard",

                size: size,

                km: 0,

                fee: rate,

                eta: "1–2 business days"

            };

        }


        /* -------------------------------------------------
           EXPRESS
        ------------------------------------------------- */

        if (method === "express") {

            if (!km || km <= 0) {

                return {

                    success: false,

                    message:
                        "Please enter the delivery distance in kilometres for Express delivery."

                };

            }


            const fee = km * KT_RATES.express.perKm;


            return {

                success: true,

                method: "express",

                methodName: "Express",

                size: "any",

                km: km,

                fee: Number(fee.toFixed(2)),

                eta: "Same day"

            };

        }


        return {

            success: false,

            message: "Please select a delivery method."

        };

    }


    /* =====================================================
       SAVE DELIVERY
    ===================================================== */

    function saveDelivery(result) {

        localStorage.setItem(
            STORAGE.method,
            result.method
        );

        localStorage.setItem(
            STORAGE.size,
            result.size
        );

        localStorage.setItem(
            STORAGE.km,
            String(result.km || 0)
        );

        localStorage.setItem(
            STORAGE.fee,
            String(result.fee)
        );

        localStorage.setItem(
            STORAGE.eta,
            result.eta
        );

    }


    /* =====================================================
       UPDATE CHECKOUT DISPLAY
    ===================================================== */

    function updateCheckoutDisplay(result) {

        const deliveryAmount = getElement("chkDelivery");

        if (deliveryAmount) {

            deliveryAmount.textContent =
                money(result.fee);

        }


        const deliverySummary =
            getElement("chkDeliverySummary");

        if (deliverySummary) {

            deliverySummary.textContent =
                `${result.methodName} • ${money(result.fee)}`;

        }


        const deliveryInfo =
            getElement("deliveryInfo");

        if (deliveryInfo) {

            let text =
                `${result.methodName} delivery`;

            if (result.method === "economy") {

                text +=
                    ` • ${capitalize(result.size)} parcel • 3–4 business days`;

            }

            if (result.method === "standard") {

                text +=
                    ` • ${capitalize(result.size)} parcel • 1–2 business days`;

            }

            if (result.method === "express") {

                text +=
                    ` • ${result.km.toFixed(1)} km × R4.50/km • Same day`;

            }

            deliveryInfo.textContent = text;

        }


        const status =
            getElement("deliveryStatus");

        if (status) {

            status.textContent =
                `✓ ${result.methodName} delivery calculated: ${money(result.fee)}`;

            status.classList.add("success");

        }


        /* -------------------------------------------------
           Tell checkout.js to refresh totals
        ------------------------------------------------- */

        if (
            window.NexpakCheckout &&
            typeof window.NexpakCheckout.updateSummary === "function"
        ) {

            window.NexpakCheckout.updateSummary();

        }

    }


    /* =====================================================
       CAPITALIZE
    ===================================================== */

    function capitalize(value) {

        if (!value) return "";

        return value.charAt(0).toUpperCase() +
               value.slice(1);

    }


    /* =====================================================
       CREATE DELIVERY UI IF NEEDED
    ===================================================== */

    function createDeliveryControls() {

        let container =
            getElement("deliveryOptions");


        /*
         * If your HTML already has delivery controls,
         * don't create duplicates.
         */

        if (
            getElement("deliveryMethod") ||
            document.querySelector(
                'input[name="deliveryMethod"]'
            )
        ) {

            return;

        }


        /*
         * Find a sensible location.
         */

        const calculateButton =
            getElement("btnCalculateDelivery");


        if (!calculateButton) {

            console.warn(
                "[Nexpak Delivery] btnCalculateDelivery not found."
            );

            return;

        }


        container =
            container ||
            document.createElement("div");

        if (!container.id) {

            container.id =
                "deliveryOptions";

        }


        container.innerHTML = `

            <div class="nexpak-delivery-selector">

                <h3>
                    Delivery Method
                </h3>

                <div class="nexpak-delivery-methods">

                    <label class="nexpak-delivery-option">

                        <input
                            type="radio"
                            name="deliveryMethod"
                            value="economy"
                        >

                        <span>

                            <strong>
                                Economy
                            </strong>

                            <small>
                                3–4 business days
                            </small>

                            <em>
                                From R89
                            </em>

                        </span>

                    </label>


                    <label class="nexpak-delivery-option">

                        <input
                            type="radio"
                            name="deliveryMethod"
                            value="standard"
                            checked
                        >

                        <span>

                            <strong>
                                Standard
                            </strong>

                            <small>
                                1–2 business days
                            </small>

                            <em>
                                From R129
                            </em>

                        </span>

                    </label>


                    <label class="nexpak-delivery-option">

                        <input
                            type="radio"
                            name="deliveryMethod"
                            value="express"
                        >

                        <span>

                            <strong>
                                Express
                            </strong>

                            <small>
                                Same-day delivery
                            </small>

                            <em>
                                R4.50/km
                            </em>

                        </span>

                    </label>

                </div>


                <div
                    id="parcelSizeContainer"
                    class="nexpak-parcel-size"
                >

                    <label for="parcelSize">
                        Parcel Size
                    </label>

                    <select id="parcelSize">

                        <option value="small">
                            Small — R89 Economy / R129 Standard
                        </option>

                        <option
                            value="medium"
                            selected
                        >
                            Medium — R129 Economy / R179 Standard
                        </option>

                        <option value="large">
                            Large — R179 Economy / R239 Standard
                        </option>

                    </select>

                </div>

            </div>

        `;


        /*
         * Insert before the calculate button.
         */

        calculateButton.parentNode.insertBefore(
            container,
            calculateButton
        );


        /*
         * Method change
         */

        document
            .querySelectorAll(
                'input[name="deliveryMethod"]'
            )
            .forEach(function (radio) {

                radio.addEventListener(
                    "change",
                    function () {

                        updateSizeVisibility();

                        clearDeliveryResult();

                    }
                );

            });


        const parcelSize =
            getElement("parcelSize");


        if (parcelSize) {

            parcelSize.addEventListener(
                "change",
                clearDeliveryResult
            );

        }


        updateSizeVisibility();

    }


    /* =====================================================
       SHOW/HIDE PARCEL SIZE
    ===================================================== */

    function updateSizeVisibility() {

        const method =
            getSelectedMethod();

        const container =
            getElement("parcelSizeContainer");

        if (!container) return;


        if (method === "express") {

            container.style.display =
                "none";

        } else {

            container.style.display =
                "block";

        }


        /*
         * Express needs distance.
         */

        const distanceField =
            getElement("distance-km");

        if (distanceField) {

            if (method === "express") {

                distanceField.disabled = false;

                distanceField.placeholder =
                    "Enter delivery distance in KM";

            } else {

                distanceField.disabled = true;

                distanceField.placeholder =
                    "Distance not required for this service";

            }

        }

    }


    /* =====================================================
       CLEAR DELIVERY RESULT
    ===================================================== */

    function clearDeliveryResult() {

        localStorage.removeItem(
            STORAGE.fee
        );

        localStorage.removeItem(
            STORAGE.eta
        );

        const amount =
            getElement("chkDelivery");

        if (amount) {

            amount.textContent =
                "R0.00";

        }


        const summary =
            getElement("chkDeliverySummary");

        if (summary) {

            summary.textContent =
                "Select delivery method";

        }


        const status =
            getElement("deliveryStatus");

        if (status) {

            status.textContent =
                "Select your delivery method and calculate delivery.";

            status.classList.remove("success");

        }


        if (
            window.NexpakCheckout &&
            typeof window.NexpakCheckout.updateSummary === "function"
        ) {

            window.NexpakCheckout.updateSummary();

        }

    }


    /* =====================================================
       CALCULATE BUTTON
    ===================================================== */

    function attachCalculateHandler() {

        const button =
            getElement("btnCalculateDelivery");


        if (!button) {

            console.warn(
                "[Nexpak Delivery] Calculate button not found."
            );

            return;

        }


        /*
         * Prevent duplicate listeners.
         */

        if (
            button.dataset.nexpakDeliveryBound === "true"
        ) {

            return;

        }


        button.dataset.nexpakDeliveryBound =
            "true";


        button.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                const result =
                    calculateDelivery();


                if (!result.success) {

                    const status =
                        getElement("deliveryStatus");

                    if (status) {

                        status.textContent =
                            result.message;

                        status.classList.remove(
                            "success"
                        );

                    }

                    alert(
                        result.message
                    );

                    return;

                }


                saveDelivery(result);

                updateCheckoutDisplay(result);

                console.log(
                    "[Nexpak Delivery] Calculated:",
                    result
                );

            }
        );

    }


    /* =====================================================
       RESTORE SAVED DELIVERY
    ===================================================== */

    function restoreDelivery() {

        const fee =
            parseFloat(
                localStorage.getItem(
                    STORAGE.fee
                )
            );


    
