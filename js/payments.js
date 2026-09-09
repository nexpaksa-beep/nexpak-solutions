document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // =========================================================================
    // NEXPAK SECURITY SOLUTIONS
    // PAYMENT CONTROLLER
    // =========================================================================
    // This file handles ONLY:
    //
    // 1. Payment method selection
    // 2. Capitec EFT / QR payment information
    // 3. Copy banking details
    // 4. Payment reference
    // 5. WhatsApp POP link
    //
    // checkout.js handles the actual order submission.
    // delivery-calculator.js handles delivery calculations.
    //
    // PAYFAST:
    // Currently disabled / under maintenance until approval.
    // =========================================================================


    // =========================================================================
    // 1. CONFIGURATION
    // =========================================================================

    const CAPITEC_BANK = 'Capitec Bank';
    const CAPITEC_ACCOUNT_NAME = 'NexPak Solutions (Pty) Ltd';
    const CAPITEC_ACCOUNT_NUMBER = '2517857594';
    const CAPITEC_BRANCH_CODE = '470010';

    const WHATSAPP_NUMBER = '27836308249';


    // =========================================================================
    // 2. DOM ELEMENTS
    // =========================================================================

    const paymentRefDisplay =
        document.getElementById(
            'payment-reference-display'
        );

    const btnCopyBank =
        document.getElementById(
            'btnCopyBankDetails'
        );

    const whatsappPopBtn =
        document.getElementById(
            'btnWhatsappPop'
        );

    const paymentMethods =
        document.querySelectorAll(
            'input[name="paymentMethod"]'
        );


    // =========================================================================
    // 3. ORDER REFERENCE
    // =========================================================================
    // checkout.js creates the official order reference.
    //
    // If checkout.js is loaded correctly, we use its reference.
    // Otherwise we fall back to the reference displayed on the page.
    // =========================================================================

    function getOrderReference() {

        if (
            window.NexpakCheckout &&
            typeof window.NexpakCheckout.getOrderReference === 'function'
        ) {

            const reference =
                window.NexpakCheckout.getOrderReference();

            if (reference) {
                return reference;
            }

        }


        if (
            paymentRefDisplay &&
            paymentRefDisplay.textContent.trim() !== ''
        ) {

            return paymentRefDisplay.textContent.trim();

        }


        // Emergency fallback
        const fallbackReference =
            'NEX-' +
            Math.floor(
                100000 +
                Math.random() * 900000
            );

        if (paymentRefDisplay) {

            paymentRefDisplay.textContent =
                fallbackReference;

        }

        return fallbackReference;

    }


    // =========================================================================
    // 4. DISPLAY PAYMENT REFERENCE
    // =========================================================================

    function updatePaymentReference() {

        const reference =
            getOrderReference();


        if (paymentRefDisplay) {

            paymentRefDisplay.textContent =
                reference;

        }


        return reference;

    }


    // =========================================================================
    // 5. BUILD BANKING DETAILS
    // =========================================================================

    function getBankDetails() {

        const reference =
            getOrderReference();


        return (
            `Bank: ${CAPITEC_BANK}\n` +
            `Account Holder: ${CAPITEC_ACCOUNT_NAME}\n` +
            `Account Number: ${CAPITEC_ACCOUNT_NUMBER}\n` +
            `Branch Code: ${CAPITEC_BRANCH_CODE}\n` +
            `Payment Reference: ${reference}`
        );

    }


    // =========================================================================
    // 6. COPY BANKING DETAILS
    // =========================================================================

    function copyBankDetails() {

        const bankInfo =
            getBankDetails();


        // -------------------------------------------------------------
        // Modern Clipboard API
        // -------------------------------------------------------------

        if (
            navigator.clipboard &&
            window.isSecureContext
        ) {

            navigator.clipboard.writeText(
                bankInfo
            )
            .then(() => {

                showCopySuccess();

            })
            .catch(() => {

                fallbackCopy(bankInfo);

            });

            return;

        }


        // -------------------------------------------------------------
        // Fallback for older / non-secure browsers
        // -------------------------------------------------------------

        fallbackCopy(bankInfo);

    }


    // =========================================================================
    // 7. COPY FALLBACK
    // =========================================================================

    function fallbackCopy(text) {

        const textarea =
            document.createElement('textarea');


        textarea.value = text;


        textarea.style.position =
            'fixed';

        textarea.style.left =
            '-9999px';


        document.body.appendChild(
            textarea
        );


        textarea.focus();

        textarea.select();


        try {

            const successful =
                document.execCommand(
                    'copy'
                );


            if (successful) {

                showCopySuccess();

            } else {

                showCopyFailure();

            }

        } catch (error) {

            console.warn(
                'Nexpak Payment: Copy failed.',
                error
            );

            showCopyFailure();

        }


        document.body.removeChild(
            textarea
        );

    }


    // =========================================================================
    // 8. COPY SUCCESS
    // =========================================================================

    function showCopySuccess() {

        if (!btnCopyBank) {
            return;
        }


        const originalHTML =
            btnCopyBank.innerHTML;


        btnCopyBank.innerHTML =
            '<i class="fa-solid fa-check"></i> Details Copied!';


        btnCopyBank.disabled =
            true;


        setTimeout(() => {

            btnCopyBank.innerHTML =
                originalHTML;

            btnCopyBank.disabled =
                false;

        }, 2500);

    }


    // =========================================================================
    // 9. COPY FAILURE
    // =========================================================================

    function showCopyFailure() {

        alert(
            `Please manually copy the banking details:\n\n${getBankDetails()}`
        );

    }


    // =========================================================================
    // 10. WHATSAPP POP LINK
    // =========================================================================

    function updateWhatsAppLink() {

        if (!whatsappPopBtn) {
            return;
        }


        const reference =
            getOrderReference();


        const message =
            encodeURIComponent(

                `Hi NexPak,\n\n` +

                `I have made payment for Order ${reference}.\n\n` +

                `Payment Reference: ${reference}\n\n` +

                `I am sending my Proof of Payment for verification.`

            );


        whatsappPopBtn.href =
            `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

    }


    // =========================================================================
    // 11. PAYMENT METHOD HANDLING
    // =========================================================================

    function handlePaymentMethodChange() {

        const selected =
            document.querySelector(
                'input[name="paymentMethod"]:checked'
            );


        if (!selected) {
            return;
        }


        const paymentMethod =
            selected.value;


        // -------------------------------------------------------------
        // CAPITEC EFT / QR
        // -------------------------------------------------------------

        if (
            paymentMethod === 'eft' ||
            paymentMethod === 'capitec' ||
            paymentMethod === 'qr'
        ) {

            updateWhatsAppLink();

            console.log(
                'Nexpak Payment: Capitec QR / EFT selected.'
            );

            return;

        }


        // -------------------------------------------------------------
        // PAYFAST
        // -------------------------------------------------------------
        // PayFast is intentionally disabled until approval.
        // -------------------------------------------------------------

        if (
            paymentMethod === 'payfast'
        ) {

            console.log(
                'Nexpak Payment: PayFast is currently disabled.'
            );

            return;

        }

    }


    // =========================================================================
    // 12. PAYMENT METHOD EVENTS
    // =========================================================================

    paymentMethods.forEach(
        paymentMethod => {

            paymentMethod.addEventListener(
                'change',
                handlePaymentMethodChange
            );

        }
    );


    // =========================================================================
    // 13. COPY BUTTON EVENT
    // =========================================================================

    if (btnCopyBank) {

        btnCopyBank.addEventListener(
            'click',
            event => {

                event.preventDefault();

                copyBankDetails();

            }
        );

    }


    // =========================================================================
    // 14. WHATSAPP POP BUTTON
    // =========================================================================

    if (whatsappPopBtn) {

        whatsappPopBtn.addEventListener(
            'click',
            () => {

                updateWhatsAppLink();

            }
        );

    }


    // =========================================================================
    // 15. PAYMENT INFORMATION
    // =========================================================================

    function exposePaymentInformation() {

        window.NexpakPayment = {

            method:
                'Capitec QR / EFT',

            status:
                'Manual Verification',

            bank:
                CAPITEC_BANK,

            accountName:
                CAPITEC_ACCOUNT_NAME,

            accountNumber:
                CAPITEC_ACCOUNT_NUMBER,

            branchCode:
                CAPITEC_BRANCH_CODE,

            whatsapp:
                WHATSAPP_NUMBER,

            getReference:
                getOrderReference,

            getBankDetails:
                getBankDetails,

            updateWhatsAppLink:
                updateWhatsAppLink

        };

    }


    // =========================================================================
    // 16. INITIALISE
    // =========================================================================

    updatePaymentReference();

    updateWhatsAppLink();

    handlePaymentMethodChange();

    exposePaymentInformation();


    console.log(
        'Nexpak Payment Controller loaded successfully.'
    );

});
