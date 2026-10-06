import { Quotation, Order, PaymentRecord, DeliveryChallan, CompanySettings, Language, DesignCatalogItem } from '@/types';
import { formatCurrency } from './currency';
import { formatDate } from './dateUtils';

export function formatWhatsAppUrl(phoneNumber: string, text: string): string {
  // Sanitize phone number (remove spaces, dashes, parentheses)
  let cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  if (cleanNumber.startsWith('01')) {
    cleanNumber = '88' + cleanNumber;
  }
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}

export function formatSmsUrl(phoneNumber: string, text: string): string {
  const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
  return `sms:${cleanNumber}?body=${encodeURIComponent(text)}`;
}

/**
 * Generate Quotation Message for WhatsApp / SMS
 */
export function generateQuotationMessage(
  quotation: Quotation,
  settings: CompanySettings,
  lang: Language = 'bn'
): string {
  if (lang === 'bn') {
    const itemsSummary = quotation.items
      .map((it, idx) => `${idx + 1}. ${it.description} (${it.quantity}টি) - ৳${it.totalAmount.toLocaleString('en-IN')}`)
      .join('\n');

    return `🏛️ *${settings.companyNameBn} (DTC)*
-----------------------------------
সম্মানিত ${quotation.customerName},
আপনার চাহিদামতো অফিসিয়াল কোটেশন প্রস্তুত করা হয়েছে।

📄 *কোটেশন নম্বর:* ${quotation.quotationNumber}
📅 *তারিখ:* ${formatDate(quotation.date, 'bn')}
⏳ *মেয়াদ:* ${formatDate(quotation.validUntil, 'bn')} পর্যন্ত

🪵 *আইটেম বিবরণ:*
${itemsSummary}

💰 *সর্বমোট প্রাক্কলিত মূল্য:* ${formatCurrency(quotation.grandTotal, 'bn')}

🔍 *অনলাইনে যাচাই ও লাইভ ট্র্যাকিং:*
https://dhakatimbercomplex.com/track/${quotation.id}

যেকোনো পরামর্শ বা বুকিংয়ের জন্য যোগাযোগ করুন:
📞 শোরুম: ${settings.phone1} | ফ্যাক্টরি: ${settings.phone2}
📍 শোরুম: ${settings.showroomAddressBn}`;
  }

  const itemsSummaryEn = quotation.items
    .map((it, idx) => `${idx + 1}. ${it.description} (${it.quantity} Pcs) - BDT ${it.totalAmount.toLocaleString()}`)
    .join('\n');

  return `🏛️ *${settings.companyNameEn} (DTC)*
-----------------------------------
Dear ${quotation.customerName},
Your official quotation is ready.

📄 *Quotation No:* ${quotation.quotationNumber}
📅 *Date:* ${formatDate(quotation.date, 'en')}
⏳ *Valid Until:* ${formatDate(quotation.validUntil, 'en')}

🪵 *Items Summary:*
${itemsSummaryEn}

💰 *Grand Total:* ${formatCurrency(quotation.grandTotal, 'en')}

🔍 *Track Online:*
https://dhakatimbercomplex.com/track/${quotation.id}

Hotline: ${settings.phone1} | ${settings.phone2}
${settings.showroomAddressEn}`;
}

/**
 * Generate Order Status / Work Order Confirmation Message
 */
export function generateOrderStatusMessage(
  order: Order,
  settings: CompanySettings,
  lang: Language = 'bn'
): string {
  const statusBnMap: Record<string, string> = {
    confirmed: 'অর্ডার নিশ্চিত হয়েছে (বুকিং সম্পন্ন)',
    wood_sizing: 'স-মিলে কাঠ সাইজিং ও চেরাই চলছে',
    carpentry: 'কারখানায় কারিগর দ্বারা পাল্লা ও ফ্রেম তৈরি হচ্ছে',
    polish: 'ফিনিশিং ও পিইউ/হ্যান্ড পলিশিং চলছে',
    ready_for_delivery: 'মালামাল সম্পূর্ণ প্রস্তুত (ডেলিভারির অপেক্ষায়)',
    partial_delivered: 'আংশিক মালামাল সাইটে পাঠানো হয়েছে',
    delivered: 'সকল মালামাল সাইটে ডেলিভারি সম্পন্ন',
  };

  const statusEnMap: Record<string, string> = {
    confirmed: 'Order Confirmed & Booked',
    wood_sizing: 'Timber Sizing & Sawmill Processing',
    carpentry: 'Carpentry & Frame Assembly in Progress',
    polish: 'Surface Sanding & PU Polishing in Progress',
    ready_for_delivery: 'Ready for Dispatch / Quality Checked',
    partial_delivered: 'Partially Dispatched to Site',
    delivered: 'Delivered Successfully to Site',
  };

  if (lang === 'bn') {
    return `🏛️ *${settings.companyNameBn} (DTC)*
-----------------------------------
সম্মানিত ${order.customerName},
আপনার কাজের অর্ডার আপডেট:

📦 *অর্ডার নম্বর:* ${order.orderNumber}
⚙️ *বর্তমান অগ্রগতি:* ${statusBnMap[order.status] || order.status} (${order.productionProgressPercent}%)
🚚 *প্রত্যাশিত ডেলিভারি:* ${formatDate(order.expectedDeliveryDate, 'bn')}

💵 *মোট বিল:* ${formatCurrency(order.grandTotal, 'bn')}
✅ *পরিশোধিত:* ${formatCurrency(order.totalPaid, 'bn')}
⚠️ *অবশিষ্ট বকেয়া:* ${formatCurrency(order.dueAmount, 'bn')}

📱 *লাইভ ফ্যাক্টরি প্রোগ্রেস ট্র্যাক করুন:*
https://dhakatimbercomplex.com/track/${order.id}

ধন্যবাদান্তে,
ঢাকা টিম্বার কমপ্লেক্স (DTC)
হটলাইন: ${settings.phone1}`;
  }

  return `🏛️ *${settings.companyNameEn} (DTC)*
-----------------------------------
Dear ${order.customerName},
Work order progress update:

📦 *Order No:* ${order.orderNumber}
⚙️ *Production Status:* ${statusEnMap[order.status] || order.status} (${order.productionProgressPercent}%)
🚚 *Expected Delivery:* ${formatDate(order.expectedDeliveryDate, 'en')}

💵 *Grand Total:* ${formatCurrency(order.grandTotal, 'en')}
✅ *Total Paid:* ${formatCurrency(order.totalPaid, 'en')}
⚠️ *Due Balance:* ${formatCurrency(order.dueAmount, 'en')}

📱 *Live Order Tracking:*
https://dhakatimbercomplex.com/track/${order.id}

Dhaka Timber Complex
Hotline: ${settings.phone1}`;
}

/**
 * Generate Money Receipt Message
 */
export function generateMoneyReceiptMessage(
  order: Order,
  payment: PaymentRecord,
  settings: CompanySettings,
  lang: Language = 'bn'
): string {
  const receiptNo = `MR-${order.orderNumber.replace(/[^0-9]/g, '') || Date.now().toString().slice(-4)}-${payment.id.slice(-3)}`;

  if (lang === 'bn') {
    return `🧾 *টাকা প্রাপ্তি রশীদ (Money Receipt)*
🏛️ *${settings.companyNameBn} (DTC)*
-----------------------------------
সম্মানিত ${order.customerName},
আপনার পেমেন্ট সফলভাবে গৃহীত হয়েছে।

🔖 *রসিদ নং:* ${receiptNo}
📦 *অর্ডার নং:* ${order.orderNumber}
📅 *তারিখ:* ${formatDate(payment.date, 'bn')}
💳 *পরিশোধের মাধ্যম:* ${payment.method}

💵 *প্রাপ্ত টাকার পরিমাণ:* ${formatCurrency(payment.amount, 'bn')}
✅ *অর্ডারে মোট জমা:* ${formatCurrency(order.totalPaid, 'bn')}
⚠️ *বর্তমান অবশিষ্ট বকেয়া:* ${formatCurrency(order.dueAmount, 'bn')}

🔍 *অনলাইন রসিদ যাচাই:*
https://dhakatimbercomplex.com/track/${order.id}

ঢাকা টিম্বার কমপ্লেক্স-এর সাথে থাকার জন্য ধন্যবাদ!`;
  }

  return `🧾 *MONEY RECEIPT*
🏛️ *${settings.companyNameEn} (DTC)*
-----------------------------------
Dear ${order.customerName},
We have received your payment with thanks.

🔖 *Receipt No:* ${receiptNo}
📦 *Order Ref:* ${order.orderNumber}
📅 *Date:* ${formatDate(payment.date, 'en')}
💳 *Payment Mode:* ${payment.method}

💵 *Amount Received:* ${formatCurrency(payment.amount, 'en')}
✅ *Total Paid So Far:* ${formatCurrency(order.totalPaid, 'en')}
⚠️ *Balance Due:* ${formatCurrency(order.dueAmount, 'en')}

🔍 *Verify Receipt Online:*
https://dhakatimbercomplex.com/track/${order.id}

Thank you for choosing Dhaka Timber Complex!`;
}

/**
 * Generate Delivery Challan Message
 */
export function generateChallanMessage(
  challan: DeliveryChallan,
  order: Order | undefined,
  settings: CompanySettings,
  lang: Language = 'bn'
): string {
  const itemsTextBn = challan.deliveredItems
    .map((it, idx) => `${idx + 1}. ${it.itemDescription} (${it.woodSpecies}) - ${it.quantity}টি`)
    .join('\n');

  const itemsTextEn = challan.deliveredItems
    .map((it, idx) => `${idx + 1}. ${it.itemDescription} (${it.woodSpecies}) - ${it.quantity} Pcs`)
    .join('\n');

  if (lang === 'bn') {
    return `🚚 *পণ্য সরবরাহ চালান (Delivery Challan)*
🏛️ *${settings.companyNameBn} (DTC)*
-----------------------------------
সম্মানিত ${challan.customerName},
আপনার অর্ডারের মালামাল ফ্যাক্টরি থেকে গাড়িতে পাঠানো হয়েছে।

📋 *চালান নম্বর:* ${challan.challanNumber}
📦 *অর্ডার রেফারেন্স:* ${challan.orderNumber}
📅 *তারিখ:* ${formatDate(challan.deliveryDate, 'bn')}
📍 *ডেলিভারি সাইট:* ${challan.deliveryAddress}

🚛 *পরিবহন তথ্য:*
গাড়ি: ${challan.vehicleNumber || 'পিকআপ ভ্যান'}
চালক: ${challan.driverName || 'ফ্যাক্টরি ডেলিভারিম্যান'} ${challan.driverPhone ? `(${challan.driverPhone})` : ''}

🪵 *সরবরাহকৃত মালামাল:*
${itemsTextBn}

${order && order.dueAmount > 0 ? `⚠️ *ডেলিভারিতে পরিশোধযোগ্য বকেয়া:* ${formatCurrency(order.dueAmount, 'bn')}\n` : ''}
সাইটে মালামাল বুঝে নিয়ে চালানের কপিতে স্বাক্ষর প্রদান করুন।

যেকোনো প্রয়োজনে যোগাযোগ: ${settings.phone1}`;
  }

  return `🚚 *DELIVERY CHALLAN DISPATCH*
🏛️ *${settings.companyNameEn} (DTC)*
-----------------------------------
Dear ${challan.customerName},
Your timber items have been dispatched from factory.

📋 *Challan No:* ${challan.challanNumber}
📦 *Order Ref:* ${challan.orderNumber}
📅 *Date:* ${formatDate(challan.deliveryDate, 'en')}
📍 *Site Location:* ${challan.deliveryAddress}

🚛 *Transport & Driver:*
Vehicle: ${challan.vehicleNumber || 'Pickup Van'}
Driver: ${challan.driverName || 'Driver'} ${challan.driverPhone ? `(${challan.driverPhone})` : ''}

🪵 *Dispatched Items:*
${itemsTextEn}

${order && order.dueAmount > 0 ? `⚠️ *Due to collect upon delivery:* ${formatCurrency(order.dueAmount, 'en')}\n` : ''}
Please inspect and sign the challan copy upon delivery.

Helpline: ${settings.phone1}`;
}

/**
 * Generate Payment Reminder Message (বকেয়া পরিশোধের নোটিশ)
 */
export function generatePaymentReminderMessage(
  data: {
    customerName: string;
    customerPhone: string;
    orderNumber?: string;
    totalAmount: number;
    totalPaid: number;
    dueAmount: number;
  },
  settings: CompanySettings,
  lang: Language = 'bn'
): string {
  if (lang === 'bn') {
    return `🏛️ *${settings.companyNameBn} (DTC)*
-----------------------------------
সম্মানিত ${data.customerName},
আসসালামু আলাইকুম।

${data.orderNumber ? `আপনার অর্ডার নং *${data.orderNumber}*-এর কাজ প্রস্তুত করা হচ্ছে।` : 'ঢাকা টিম্বার কমপ্লেক্স-এ আপনার কাজের চলমান হিসাব বিবরণী:'}

💰 *মোট বিল:* ${formatCurrency(data.totalAmount, 'bn')}
✅ *মোট জমা:* ${formatCurrency(data.totalPaid, 'bn')}
🔴 *অবশিষ্ট বকেয়া:* ${formatCurrency(data.dueAmount, 'bn')}

পরবর্তী ধাপের ফিনিশিং ও মালামাল নির্বিঘ্নে সাইটে ডেলিভারি নিশ্চিত করতে অবশিষ্ট বকেয়া পরিশোধের অনুরোধ জানাচ্ছি।

🏦 *পেমেন্ট করার ঠিকানা:*
ব্যাংক: ${settings.bankDetails.bankName}
হিসাব: ${settings.bankDetails.accountNumber} (${settings.bankDetails.accountName})
বিকাশ / নগদ: ${settings.mobileBanking.bKashMerchant || settings.mobileBanking.bKashPersonal}

ধন্যবাদান্তে,
অ্যাকাউন্স বিভাগ
ঢাকা টিম্বার কমপ্লেক্স (DTC)
ফোন: ${settings.phone1} / ${settings.phone2}`;
  }

  return `🏛️ *${settings.companyNameEn} (DTC)*
-----------------------------------
Dear ${data.customerName},
Friendly payment reminder regarding your timber work order ${data.orderNumber ? `(${data.orderNumber})` : ''}.

💰 *Total Billed:* ${formatCurrency(data.totalAmount, 'en')}
✅ *Total Paid:* ${formatCurrency(data.totalPaid, 'en')}
🔴 *Outstanding Balance:* ${formatCurrency(data.dueAmount, 'en')}

Kindly settle the remaining balance to ensure seamless delivery.

🏦 *Payment Details:*
Bank: ${settings.bankDetails.bankName} | A/C: ${settings.bankDetails.accountNumber} (${settings.bankDetails.accountName})
bKash/Nagad: ${settings.mobileBanking.bKashMerchant || settings.mobileBanking.bKashPersonal}

Thank you,
Dhaka Timber Complex
Phone: ${settings.phone1}`;
}

/**
 * Generate Design Catalog Share Message
 */
export function generateCatalogShareMessage(
  item: DesignCatalogItem,
  settings: CompanySettings,
  lang: Language = 'bn'
): string {
  if (lang === 'bn') {
    return `🪵 *${item.titleBn}*
🏛️ *${settings.companyNameBn} (DTC)*
-----------------------------------
🏷️ *মডেল কোড:* ${item.code}
🌳 *কাঠের প্রজাতি:* ${item.woodSpecies}
✨ *সুপারিশকৃত পলিশ:* ${item.recommendedPolish}
📐 *স্ট্যান্ডার্ড সাইজ:* ${item.standardSizes.join(', ')}
💰 *আনুমানিক মূল্য:* ৳ ${item.priceEstimatePerPiece.toLocaleString('en-IN')} / পিস

📝 *বিবরণ:* ${item.descriptionBn}

অর্ডার ও কাস্টম সাইজ কোটেশনের জন্য যোগাযোগ করুন:
📞 ${settings.phone1} | 📍 ${settings.showroomAddressBn}
🌐 www.dhakatimbercomplex.com`;
  }

  return `🪵 *${item.titleEn}*
🏛️ *${settings.companyNameEn} (DTC)*
-----------------------------------
🏷️ *Model Code:* ${item.code}
🌳 *Wood Species:* ${item.woodSpecies}
✨ *Finish:* ${item.recommendedPolish}
📐 *Sizes:* ${item.standardSizes.join(', ')}
💰 *Estimated Rate:* BDT ${item.priceEstimatePerPiece.toLocaleString()} / Pc

📝 *Description:* ${item.descriptionEn}

Order Hotline: ${settings.phone1}
${settings.showroomAddressEn}`;
}
