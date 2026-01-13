import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface CustomWigOrder {
  id: string;
  shopify_order_id: string;
  shopify_order_number: string | null;
  customer_email: string;
  customer_name: string | null;
  base_bundle: string;
  base_price: number;
  addon_cost: number;
  total_price: number;
  configuration: Record<string, string>;
  custom_sku: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  processed_at: string | null;
}

interface PrintableOrderSheetProps {
  order: CustomWigOrder;
}

export function PrintableOrderSheet({ order }: PrintableOrderSheetProps) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
      }).format(amount);
    };

    const configItems = Object.entries(order.configuration)
      .map(([key, value]) => `
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #ddd; background: #f9f9f9; font-weight: 600; width: 40%;">${key}</td>
          <td style="padding: 8px 12px; border: 1px solid #ddd;">${value}</td>
        </tr>
      `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Custom Wig Order - ${order.custom_sku || order.shopify_order_number}</title>
        <style>
          @media print {
            body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid #D4AF37;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #1a1a1a;
          }
          .logo span { color: #D4AF37; }
          .order-info {
            text-align: right;
          }
          .order-number {
            font-size: 24px;
            font-weight: bold;
            color: #D4AF37;
          }
          .sku {
            font-family: monospace;
            font-size: 14px;
            color: #666;
            margin-top: 5px;
          }
          .date {
            font-size: 12px;
            color: #888;
            margin-top: 5px;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #666;
            margin-bottom: 10px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
          }
          .customer-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          .customer-info p {
            margin: 0 0 5px;
          }
          .customer-info label {
            font-size: 11px;
            color: #888;
            text-transform: uppercase;
          }
          .customer-info span {
            font-weight: 500;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          .pricing-table td {
            padding: 10px 12px;
            border: 1px solid #ddd;
          }
          .pricing-table .label {
            font-weight: 500;
          }
          .pricing-table .amount {
            text-align: right;
            font-family: monospace;
          }
          .pricing-table .total-row {
            background: #f5f5f5;
            font-weight: bold;
            font-size: 18px;
          }
          .pricing-table .addon-row {
            color: #D4AF37;
          }
          .notes-section {
            background: #fffef5;
            border: 1px solid #D4AF37;
            border-radius: 8px;
            padding: 15px;
          }
          .notes-section p {
            margin: 0;
            white-space: pre-wrap;
          }
          .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .status-pending { background: #fef3cd; color: #856404; }
          .status-processing { background: #cce5ff; color: #004085; }
          .status-completed { background: #d4edda; color: #155724; }
          .status-cancelled { background: #f8d7da; color: #721c24; }
          .signature-section {
            margin-top: 50px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 50px;
          }
          .signature-line {
            border-top: 1px solid #333;
            padding-top: 10px;
            font-size: 12px;
            color: #666;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 11px;
            color: #888;
            border-top: 1px solid #eee;
            padding-top: 20px;
          }
          .checklist {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          .checklist li {
            padding: 8px 0;
            border-bottom: 1px dashed #ddd;
            display: flex;
            gap: 10px;
          }
          .checklist li::before {
            content: "☐";
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Luna <span>Lux</span> Hair</div>
          <div class="order-info">
            <div class="order-number">#${order.shopify_order_number || order.shopify_order_id}</div>
            ${order.custom_sku ? `<div class="sku">${order.custom_sku}</div>` : ''}
            <div class="date">${format(new Date(order.created_at), "MMMM d, yyyy 'at' h:mm a")}</div>
            <div style="margin-top: 10px;">
              <span class="status-badge status-${order.status}">${order.status}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Customer Information</div>
          <div class="customer-info">
            <div>
              <label>Name</label>
              <p><span>${order.customer_name || 'Not provided'}</span></p>
            </div>
            <div>
              <label>Email</label>
              <p><span>${order.customer_email}</span></p>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Wig Configuration</div>
          <table>
            <tr>
              <td style="padding: 8px 12px; border: 1px solid #ddd; background: #1a1a1a; color: white; font-weight: 600; width: 40%;">Base Bundle</td>
              <td style="padding: 8px 12px; border: 1px solid #ddd; background: #1a1a1a; color: #D4AF37; font-weight: 600;">${order.base_bundle}</td>
            </tr>
            ${configItems}
          </table>
        </div>

        <div class="section">
          <div class="section-title">Pricing Breakdown</div>
          <table class="pricing-table">
            <tr>
              <td class="label">Base Bundle (${order.base_bundle})</td>
              <td class="amount">${formatCurrency(Number(order.base_price))}</td>
            </tr>
            ${Number(order.addon_cost) > 0 ? `
            <tr class="addon-row">
              <td class="label">Add-on Customizations</td>
              <td class="amount">+${formatCurrency(Number(order.addon_cost))}</td>
            </tr>
            ` : ''}
            <tr class="total-row">
              <td class="label">TOTAL</td>
              <td class="amount">${formatCurrency(Number(order.total_price))}</td>
            </tr>
          </table>
        </div>

        ${order.notes ? `
        <div class="section">
          <div class="section-title">Internal Notes</div>
          <div class="notes-section">
            <p>${order.notes}</p>
          </div>
        </div>
        ` : ''}

        <div class="section">
          <div class="section-title">Production Checklist</div>
          <ul class="checklist">
            <li>Verify base bundle specifications</li>
            <li>Apply all customizations per configuration</li>
            <li>Quality control check</li>
            <li>Photography for customer preview</li>
            <li>Package for shipping</li>
          </ul>
        </div>

        <div class="signature-section">
          <div>
            <div class="signature-line">Prepared By / Date</div>
          </div>
          <div>
            <div class="signature-line">Quality Checked By / Date</div>
          </div>
        </div>

        <div class="footer">
          <p>Luna Lux Hair | Custom Wig Production Sheet</p>
          <p>Printed on ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <Button onClick={handlePrint} variant="outline" size="sm">
      <Printer className="w-4 h-4 mr-2" />
      Print Order Sheet
    </Button>
  );
}
