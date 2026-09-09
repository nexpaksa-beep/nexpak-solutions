<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Checkout | NexPak Solutions</title>
    <!-- FontAwesome 6 Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary: #0284c7;
            --primary-dark: #0369a1;
            --dark-card: #0f172a;
            --dark-card-border: #1e293b;
            --bg-light: #f1f5f9;
            --border-color: #e2e8f0;
            --text-main: #0f172a;
            --text-muted: #64748b;
            --accent-green: #16a34a;
        }

        * { box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--bg-light);
            color: var(--text-main);
            margin: 0;
            padding: 24px 12px;
        }

        .checkout-container {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr 400px;
            gap: 24px;
        }

        .checkout-card {
            background: #ffffff;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            margin-bottom: 24px;
            border: 1px solid var(--border-color);
        }

        h2 {
            margin-top: 0;
            font-size: 20px;
            color: var(--text-main);
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
        }

        /* CALCULATOR ROW LAYOUT WITH ICONS */
        .calc-row {
            display: flex;
            align-items: flex-start;
            gap: 14px;
            margin-bottom: 18px;
            padding: 14px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }

        .calc-icon-box {
            width: 42px;
            height: 42px;
            min-width: 42px;
            border-radius: 8px;
            background: #e0f2fe;
            color: var(--primary);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
        }

        .calc-content {
            flex-grow: 1;
        }

        .calc-content label {
            display: block;
            font-weight: 700;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--text-muted);
            margin-bottom: 6px;
        }

        .form-control {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            font-size: 14px;
            background: #ffffff;
        }

        .form-control:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            padding: 12px 16px;
            background-color: var(--primary);
            color: #ffffff;
            border: none;
            border-radius: 6px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s;
        }

        .btn:hover { background-color: var(--primary-dark); }

        /* CALCULATED DELIVERY FEE DISPLAY ROW */
        .delivery-result-box {
            background: #f0fdf4;
            border-color: #bbf7d0;
        }

        .delivery-result-box .calc-icon-box {
            background: #dcfce7;
            color: var(--accent-green);
        }

        .delivery-price-tag {
            font-size: 22px;
            font-weight: 800;
            color: var(--accent-green);
            margin-top: 2px;
        }

        /* DARK CSS CAPITEC EFT LAYOUT */
        .dark-eft-card {
            background: var(--dark-card);
            color: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            border: 1px solid var(--dark-card-border);
            margin-top: 15px;
        }

        .qr-bank-grid {
            display: grid;
            grid-template-columns: 180px 1fr;
            gap: 20px;
            align-items: center;
        }

        .capitec-qr-img {
            width: 100%;
            border-radius: 8px;
            border: 2px solid #334155;
            background: #ffffff;
            padding: 4px;
        }

        .qr-caption {
            font-size: 11px;
            color: #94a3b8;
            text-align: center;
            margin-top: 6px;
        }

        .bank-details-dark {
            background: #1e293b;
            padding: 16px;
            border-radius: 8px;
            border: 1px solid #334155;
            font-size: 14px;
            line-height: 1.6;
        }

        .bank-details-dark h4 {
            margin: 0 0 10px 0;
            color: #38bdf8;
            font-size: 16px;
            border-bottom: 1px solid #334155;
            padding-bottom: 6px;
        }

        .bank-details-dark p { margin: 4px 0; color: #cbd5e1; }
        .highlight-ref-dark { color: #facc15; font-weight: bold; font-family: monospace; font-size: 15px; }

        .bank-action-buttons {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 14px;
        }

        .btn-copy-dark {
            background: #334155;
            color: #ffffff;
            border: none;
            padding: 9px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
        }

        .btn-copy-dark:hover { background: #475569; }

        .btn-whatsapp {
            background-color: #25d366;
            color: #fff;
            text-decoration: none;
            padding: 9px 12px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: bold;
            text-align: center;
        }

        .btn-whatsapp:hover { background-color: #1eb857; }

        /* PAYMENT SELECTION BADGES */
        .payment-option { border: 2px solid var(--border-color); border-radius: 8px; padding: 16px; margin-bottom: 14px; }
        .payment-option.active { border-color: var(--primary); }
        .payment-option.disabled-option { opacity: 0.65; background: #f8fafc; cursor: not-allowed; }
        
        .badge { font-size: 11px; padding: 4px 8px; border-radius: 12px; font-weight: bold; text-transform: uppercase; }
        .badge-instant { background: #dcfce7; color: #15803d; }
        .badge-maintenance { background: #fee2e2; color: #b91c1c; }

        /* LOGO & PARTNER BADGES FOOTER */
        .trust-footer {
            grid-column: 1 / -1;
            background: #ffffff;
            border-radius: 12px;
            padding: 24px;
            border: 1px solid var(--border-color);
            margin-top: 10px;
            text-align: center;
        }

        .trust-footer h4 {
            margin: 0 0 18px 0;
            color: var(--text-muted);
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .logo-badge-grid {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            gap: 16px;
        }

        .logo-card {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px 16px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            height: 52px;
            min-width: 120px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.03);
        }

        .logo-card img {
            max-height: 28px;
            max-width: 100px;
            object-fit: contain;
        }

        .logo-card.courier-guy { background: #002b49; border-color: #002b49; color: #ffffff; font-weight: 800; font-size: 13px; }
        .logo-card.kt-couriers { background: #dc2626; border-color: #dc2626; color: #ffffff; font-weight: 800; font-size: 13px; }
        .logo-card.instant-eft { background: #0f172a; border-color: #0f172a; color: #38bdf8; font-weight: 700; font-size: 13px; }

        @media (max-width: 900px) {
            .checkout-container { grid-template-columns: 1fr; }
            .qr-bank-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>

<div class="checkout-container">
    
    <!-- LEFT COLUMN: Delivery Calculator, Customer Info & Payment Options -->
    <div class="checkout-main">
        
        <!-- 1. DELIVERY CALCULATOR SECTION -->
        <div class="checkout-card">
            <h2><i class="fa-solid fa-truck-ramp-box" style="color: var(--primary);"></i> Express Courier & Delivery Calculator</h2>

            <!-- ROW 1: WAREHOUSE ADDRESS (SECURITY SHOP ICON) -->
            <div class="calc-row">
                <div class="calc-icon-box">
                    <i class="fa-solid fa-shield-halved"></i>
                </div>
                <div class="calc-content">
                    <label>Dispatch Warehouse & Store</label>
                    <div style="font-weight: 600; font-size: 14px; color: #1e293b;">
                        NexPak Security & Packaging Store &bull; Benoni Hub
                    </div>
                </div>
            </div>

            <!-- ROW 2: DESTINATION ADDRESS (HOME ICON) -->
            <div class="calc-row">
                <div class="calc-icon-box">
                    <i class="fa-solid fa-house-chimney"></i>
                </div>
                <div class="calc-content">
                    <label for="shippingAddress">Delivery Destination Address *</label>
                    <textarea id="shippingAddress" class="form-control" rows="2" placeholder="Street Address, Suburb, City (e.g. Boksburg, Sandton, Midrand)" required></textarea>
                </div>
            </div>

            <!-- ROW 3: CALCULATE DISTANCE (CALCULATOR ICON) -->
            <div class="calc-row">
                <div class="calc-icon-box">
                    <i class="fa-solid fa-calculator"></i>
                </div>
                <div class="calc-content">
                    <label for="distance-km">Distance Calculation (KM from Benoni)</label>
                    <div style="display: flex; gap: 10px;">
                        <input type="number" id="distance-km" class="form-control" placeholder="Auto-detect or enter KM" min="0" step="0.1">
                        <button type="button" id="btnCalculateDelivery" class="btn" style="width: auto; padding: 0 20px;">
                            Calculate
                        </button>
                    </div>
                </div>
            </div>

            <!-- ROW 4: CALCULATED FEE RESULT (DELIVERY VEHICLE ICON) -->
            <div class="calc-row delivery-result-box">
                <div class="calc-icon-box">
                    <i class="fa-solid fa-truck-fast"></i>
                </div>
                <div class="calc-content">
                    <label>Calculated Delivery Fee</label>
                    <div class="delivery-price-tag" id="chkDelivery">R 0.00</div>
                    <div id="deliveryInfo" style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                        <span id="deliveryStatus">Enter destination above to compute distance & weight fees.</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 2. CUSTOMER CONTACT DETAILS -->
        <div class="checkout-card">
            <h2><i class="fa-solid fa-user-check" style="color: var(--primary);"></i> Contact Details</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                    <label style="font-size: 13px; font-weight: 600;">Full Name *</label>
                    <input type="text" id="customerName" class="form-control" placeholder="John Doe" required>
                </div>
                <div>
                    <label style="font-size: 13px; font-weight: 600;">Phone / WhatsApp *</label>
                    <input type="tel" id="customerPhone" class="form-control" placeholder="083 630 8249" required>
                </div>
            </div>
            <div style="margin-top: 12px;">
                <label style="font-size: 13px; font-weight: 600;">Email Address *</label>
                <input type="email" id="customerEmail" class="form-control" placeholder="john@example.com" required>
            </div>
        </div>

        <!-- 3. PAYMENT METHODS -->
        <div class="checkout-card">
            <h2><i class="fa-solid fa-credit-card" style="color: var(--primary);"></i> Payment Method</h2>

            <!-- CAPITEC QR & INSTANT EFT (DARK CARD LAYOUT) -->
            <div class="payment-option active">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <label style="font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                        <input type="radio" name="paymentMethod" value="eft" checked> Capitec QR / Instant EFT
                    </label>
                    <span class="badge badge-instant">Instant Approval</span>
                </div>

                <!-- DARK CSS CAPITEC CARD -->
                <div class="dark-eft-card">
                    <div class="qr-bank-grid">
                        <div style="text-align: center;">
                            <img src="assets/capitec-qr.jpg" 
                                 onerror="this.onerror=null; this.src='https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=CapitecPay-NexPak-2517857594';" 
                                 alt="Capitec Scan to Pay" 
                                 class="capitec-qr-img">
                            <div class="qr-caption">Scan with Capitec App</div>
                        </div>

                        <!-- BANK DETAILS FORMAT -->
                        <div class="bank-details-dark">
                            <h4>Capitec Business Bank</h4>
                            <p><strong>Account Name:</strong> Nexpak Solutions PTY Ltd</p>
                            <p><strong>Account Number:</strong> 2517857594</p>
                            <p><strong>Branch Code:</strong> 470010</p>
                            <p><strong>Reference:</strong> <span id="payment-reference-display" class="highlight-ref-dark">NEX-ORDER</span></p>
                            
                            <div class="bank-action-buttons">
                                <button type="button" id="btnCopyBankDetails" class="btn-copy-dark">
                                    <i class="fa-regular fa-copy"></i> Copy Banking Details
                                </button>
                                <a id="btnWhatsappPop" href="https://wa.me/27836308249" target="_blank" class="btn-whatsapp">
                                    <i class="fa-brands fa-whatsapp"></i> Send POP via WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- PAYFAST (UNDER MAINTENANCE) -->
            <div class="payment-option disabled-option">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <label style="font-weight: 700; color: #64748b; display: flex; align-items: center; gap: 8px;">
                        <input type="radio" name="paymentMethod" value="payfast" disabled> PayFast Card Gateway
                    </label>
                    <span class="badge badge-maintenance">Under Maintenance</span>
                </div>
            </div>
        </div>
    </div>

    <!-- RIGHT COLUMN: FINANCIAL SUMMARY -->
    <div class="checkout-sidebar">
        <div class="checkout-card" style="position: sticky; top: 20px;">
            <h2>Order Summary</h2>
            <div id="checkoutOrderItems"></div>
            <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 15px 0;">
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                <span>Subtotal (Excl. VAT)</span>
                <span id="chkSubtotal">R 0.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                <span>Delivery Charge</span>
                <span id="chkDeliverySummary">R 0.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                <span>VAT (15%)</span>
                <span id="chkVat">R 0.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 12px; font-size: 18px; font-weight: 800; border-top: 2px solid var(--text-main); padding-top: 10px;">
                <span>Total Due</span>
                <span id="chkGrandTotal">R 0.00</span>
            </div>

            <button type="button" id="btnCompleteCheckout" class="btn" style="background-color: var(--accent-green); margin-top: 20px; font-size: 16px;">
                <i class="fa-solid fa-lock"></i> Complete Order
            </button>
        </div>
    </div>

    <!-- BOTTOM OF PAGE: PAYMENT LOGOS & COURIER PARTNERS FOOTER -->
    <div class="trust-footer">
        <h4>Guaranteed Secure Payments & Trusted Express Logistics</h4>
        <div class="logo-badge-grid">
            
            <!-- PayFast Logo -->
            <div class="logo-card" title="PayFast Gateway">
                <img src="https://www.payfast.co.za/wp-content/uploads/2020/09/PayFast-Logo.png" 
                     onerror="this.onerror=null; this.src='https://placehold.co/110x28/f8fafc/0284c7?text=PayFast';" 
                     alt="PayFast">
            </div>

            <!-- Professional Instant EFT -->
            <div class="logo-card instant-eft" title="Instant EFT">
                <i class="fa-solid fa-bolt" style="color: #facc15; margin-right: 6px;"></i> Instant EFT
            </div>

            <!-- Visa Logo -->
            <div class="logo-card" title="Visa">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" 
                     alt="Visa">
            </div>

            <!-- MasterCard Logo -->
            <div class="logo-card" title="MasterCard">
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" 
                     alt="MasterCard">
            </div>

            <!-- The Courier Guy -->
            <div class="logo-card courier-guy" title="The Courier Guy">
                <i class="fa-solid fa-truck-fast" style="color: #38bdf8; margin-right: 6px;"></i> COURIER GUY
            </div>

            <!-- KT Couriers -->
            <div class="logo-card kt-couriers" title="KT Couriers">
                <i class="fa-solid fa-box" style="color: #ffffff; margin-right: 6px;"></i> KT COURIERS
            </div>

        </div>
    </div>

</div>

<script src="checkout.js"></script>
</body>
</html>
    
