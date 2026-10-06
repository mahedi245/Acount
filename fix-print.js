const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/components/marketing/CommissionVoucherModal.tsx',
  'src/components/orders/MoneyReceiptPrintModal.tsx',
  'src/components/delivery/ChallanPrintView.tsx',
  'src/components/quotations/QuotationPrintView.tsx',
  'src/components\orders\InvoicePrintView.tsx',
  'src/app/track/[id]/page.tsx',
  'src/components/accounts/AccountStatementPrintModal.tsx',
  'src/components/craftsmen/CraftsmanTaskSlipModal.tsx',
  'src/app/inventory/page.tsx',
  'src/app/attendance/page.tsx',
  'src/app/craftsmen/page.tsx',
  'src/app/production/page.tsx',
  'src/app/reports/page.tsx',
  'src/app/cft-calculator/page.tsx',
  'src/app/customers/page.tsx'
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Change table wrapper overflow
  if (content.includes('overflow-x-auto')) {
     content = content.replace(/className="(.*?)overflow-x-auto(.*?)"/g, (match, p1, p2) => {
        if (!p1.includes('print:overflow-hidden') && !p2.includes('print:overflow-hidden')) {
          changed = true;
          return `className="${p1}overflow-x-auto print:overflow-hidden print:w-full${p2}"`;
        }
        return match;
     });
  }

  // Remove QRCode import and usages
  if (content.includes('QRCode')) {
     changed = true;
     // Remove import
     content = content.replace(/import\s+QRCode\s+from\s+[^;]+;\n/g, '');
     
     // The QR Code is usually wrapped in a col-span-2 block like:
     // {/* QR Code Verification Box */}
     // <div className="col-span-2 flex flex-col items-center justify-center ...
     //   <QRCode ... />
     //   ...
     // </div>
     // Or similar.
     
     // Quickest way for JS is to just regex match the block if possible, or just strip the QRCode tag
     // Let's strip the `<QRCode ... />` tag first
     content = content.replace(/<QRCode[^>]*\/>/g, '');
     
     // Then remove the specific texts 'Scan to Track', 'গেটপাস ভেরিফাইড', 'স্ক্যান করে ট্র্যাক করুন'
     content = content.replace(/<span[^>]*>[^<]*(স্ক্যান করে ট্র্যাক করুন|Scan to Track|গেটপাস ভেরিফাইড|Verified)[^<]*<\/span>/g, '');
     
     // The empty wrapper `<div className="col-span-2 flex flex-col items-center justify-center ..."` might remain, 
     // but it'll just be empty whitespace. To keep layout, we should adjust the previous `col-span-4` to `col-span-6`.
     content = content.replace(/col-span-4(.*?)col-span-2 flex flex-col items-center/g, 'col-span-6$1hidden ');
     content = content.replace(/col-span-4(.*?)col-span-2 bg-white/g, 'col-span-6$1hidden ');

  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log('Fixed', filePath);
  }
}

filesToFix.forEach(p => {
  const fullPath = path.join(__dirname, p.replace(/\/g, '/'));
  if (fs.existsSync(fullPath)) {
    processFile(fullPath);
  }
});

