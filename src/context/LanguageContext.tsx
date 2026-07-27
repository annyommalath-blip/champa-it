import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type Language = "en" | "lo";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be inside LanguageProvider");
  return ctx;
};

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    "nav.home": "Home",
    "nav.shop": "Shop",
    "nav.services": "Services",
    "nav.chat": "Chat",
    "nav.profile": "Profile",
    "nav.signIn": "Sign In",
    "nav.cart": "Cart",

    // Announcement
    "banner.freeShipping": "🔥 Free shipping on orders over $1,000 —",
    "banner.shopNow": "Shop Now",

    // About / Home
    "home.quickActions": "Quick Actions",
    "home.featuredProducts": "Featured Products",
    "home.more": "More",
    "home.services": "IT Consulting & Managed Services",
    "home.servicesDesc": "Infrastructure assessments, cloud migration, 24/7 support",
    "home.learnMore": "Learn More",
    "home.todaysDeals": "Today's Deals",
    "home.stats.clients": "Clients",
    "home.stats.support": "Support",
    "home.stats.sla": "SLA",
    "home.stats.partners": "Partners",
    "home.trustedPartners": "Trusted Partners",
    "home.getQuote": "Get Quote",
    "home.liveChat": "Live Chat",
    "home.deals": "Deals",
    "home.6services": "6 Services",

    // Shop
    "shop.title": "Shop",
    "shop.subtitle": "Browse enterprise hardware, software, and service packages.",
    "shop.search": "Search products...",
    "shop.inStockOnly": "In Stock Only",
    "shop.price": "Price",
    "shop.addToCart": "Add to Cart",
    "shop.outOfStock": "Out of Stock",
    "shop.noProducts": "No products found matching your criteria.",
    "shop.product": "product",
    "shop.products": "products",

    // Product Detail
    "product.backToShop": "Back to Shop",
    "product.inStock": "In Stock",
    "product.outOfStock": "Out of Stock",
    "product.quantity": "Quantity:",
    "product.addToCart": "Add to Cart",
    "product.specifications": "Specifications",
    "product.notFound": "Product not found.",

    // Cart
    "cart.title": "Cart",
    "cart.items": "items",
    "cart.item": "item",
    "cart.empty": "Your cart is empty",
    "cart.emptyDesc": "Browse our products and add something you need.",
    "cart.browseShop": "Browse Shop",
    "cart.continueShopping": "Continue Shopping",
    "cart.total": "Total",
    "cart.checkout": "Proceed to Checkout",
    "cart.checkoutTitle": "Checkout",
    "cart.fullName": "Full Name",
    "cart.phone": "Phone Number",
    "cart.email": "Email",
    "cart.address": "Delivery Address",
    "cart.notes": "Notes",
    "cart.placeOrder": "Place Order",
    "cart.each": "each",
    "cart.orderSuccess": "Order placed successfully! We'll contact you shortly.",
    "cart.step.info": "Customer Info",
    "cart.step.delivery": "Delivery",
    "cart.step.payment": "Payment",
    "cart.next": "Next",
    "cart.back": "Back",
    "cart.deliveryMethod": "Delivery Method",
    "cart.pickup": "Pick up at our office",
    "cart.pickupDesc": "Free — collect at our office",
    "cart.delivery": "Delivery",
    "cart.deliveryDesc": "Flat rate delivery fee",
    "cart.deliveryFee": "Delivery Fee",
    "cart.free": "Free",
    "cart.grandTotal": "Grand Total",
    "cart.subtotal": "Subtotal",
    "cart.paymentTitle": "Payment",
    "cart.paymentDesc": "Scan the QR code below to pay, then upload your payment screenshot.",
    "cart.qrPlaceholder": "QR code will be available soon",
    "cart.uploadScreenshot": "Upload Payment Screenshot",
    "cart.uploadedScreenshot": "Screenshot Uploaded",
    "cart.changeScreenshot": "Change",
    "cart.submitOrder": "Submit Order",
    "cart.screenshotRequired": "Please upload your payment screenshot",
    "cart.loginRequired": "Please sign in to place an order",

    // Services
    "services.badge": "Professional Services",
    "services.title": "IT Services & Consulting",
    "services.subtitle": "From infrastructure audits to fully managed IT — we help businesses run reliably, securely, and at scale.",
    "services.requestQuote": "Request a Free Quote",
    "services.whatWeOffer": "What We Offer",
    "services.quoteTitle": "Request a Quote",
    "services.quoteSubtitle": "Tell us about your project and we'll get back to you within 24 hours.",
    "services.notSure": "Not Sure What You Need?",
    "services.notSureDesc": "Our sales engineers can help you find the right combination of hardware, software, and services.",
    "services.chatWithSales": "Chat with Sales",
    "services.name": "Name",
    "services.email": "Email",
    "services.phone": "Phone",
    "services.company": "Company",
    "services.serviceType": "Service Type",
    "services.selectService": "Select a service...",
    "services.budget": "Budget Range",
    "services.select": "Select...",
    "services.timeline": "Timeline",
    "services.projectDetails": "Project Details",
    "services.projectPlaceholder": "Describe your project requirements...",
    "services.submitQuote": "Submit Quote Request",
    "services.quoteSuccess": "Quote request submitted! Our team will contact you within 24 hours.",
    "services.fillRequired": "Please fill in all required fields.",

    // Contact
    "contact.title": "Contact Sales",
    "contact.subtitle": "Get in touch with our team. We typically respond within 1 hour.",
    "contact.preferredTime": "Preferred Contact Time",
    "contact.timePlaceholder": "e.g., 9 AM - 12 PM EST",
    "contact.message": "Message",
    "contact.sendMessage": "Send Message",
    "contact.success": "Your message has been sent! Our team will reach out soon.",
    "contact.fillRequired": "Please fill in required fields",

    // Profile
    "profile.welcome": "Welcome to Champa",
    "profile.signInDesc": "Sign in to view your orders, manage your profile, and access exclusive features.",
    "profile.signIn": "Sign In",
    "profile.createAccount": "Create Account",
    "profile.hello": "Hello",
    "profile.orders": "Orders",
    "profile.ordersDesc": "Track & manage",
    "profile.wishlist": "Wishlist",
    "profile.wishlistDesc": "Saved items",
    "profile.addresses": "Addresses",
    "profile.addressesDesc": "Shipping info",
    "profile.payments": "Payments",
    "profile.paymentsDesc": "Cards & billing",
    "profile.adminPortal": "Admin Portal",
    "profile.adminPortalDesc": "Manage products, orders & more",
    "profile.itemsInCart": "items in cart",
    "profile.itemInCart": "item in cart",
    "profile.account": "Account",
    "profile.accountSettings": "Account Settings",
    "profile.helpSupport": "Help & Support",
    "profile.buyAgain": "Buy Again",
    "profile.signOut": "Sign Out",
    "profile.language": "Language",
    "profile.languageDesc": "Choose your preferred language",

    // Auth
    "auth.signInTitle": "Sign in to your account",
    "auth.signUpTitle": "Create a new account",
    "auth.resetTitle": "Reset your password",
    "auth.signInTab": "Sign In",
    "auth.signUpTab": "Sign Up",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.fullName": "Full Name",
    "auth.forgotPassword": "Forgot password?",
    "auth.signInBtn": "Sign In",
    "auth.signUpBtn": "Create Account",
    "auth.sendResetLink": "Send Reset Link",
    "auth.backToSignIn": "Back to Sign In",
    "auth.adminCheckbox": "Sign up as Champa Admin",
    "auth.adminCheckboxDesc": "Request admin access (requires approval)",
    "auth.adminReason": "Reason for admin access",
    "auth.adminReasonPlaceholder": "Explain why you need admin access...",
    "auth.welcomeBack": "Welcome back!",
    "auth.checkEmail": "Check your email to verify your account!",
    "auth.resetSent": "Password reset email sent!",
    "auth.minPassword": "Password must be at least 6 characters",

    // Notifications
    "notifications.title": "Notifications",
    "notifications.subtitle": "Your notifications will appear here",
    "notifications.empty": "No notifications yet",
    "notifications.emptyDesc": "Sign in to receive order updates and messages",

    // Footer
    "footer.tagline": "Best Service Mind With Reasonable Price. Your trusted partner for enterprise technology solutions.",
    "footer.products": "Products",
    "footer.serversHardware": "Servers & Hardware",
    "footer.networking": "Networking",
    "footer.security": "Security",
    "footer.software": "Software",
    "footer.services": "Services",
    "footer.itConsulting": "IT Consulting",
    "footer.cloudMigration": "Cloud Migration",
    "footer.managedIT": "Managed IT",
    "footer.getAQuote": "Get a Quote",
    "footer.company": "Company",
    "footer.aboutUs": "About Us",
    "footer.contactSales": "Contact Sales",
    "footer.myProfile": "My Profile",
    "footer.rights": "All rights reserved.",

    // Support
    "support.liveAgent": "Live Agent",
    "support.chatWithSupport": "Chat with support",
    "support.contactSales": "Contact Sales",
    "support.getAQuote": "Get a quote",
  },
  lo: {
    // Nav
    "nav.home": "ໜ້າຫຼັກ",
    "nav.shop": "ຮ້ານຄ້າ",
    "nav.services": "ບໍລິການ",
    "nav.chat": "ແຊັດ",
    "nav.profile": "ໂປຣໄຟລ໌",
    "nav.signIn": "ເຂົ້າສູ່ລະບົບ",
    "nav.cart": "ກະຕ່າ",

    // Announcement
    "banner.freeShipping": "🔥 ສົ່ງຟຣີ ສຳລັບຄຳສັ່ງຊື້ທີ່ເກີນ $1,000 —",
    "banner.shopNow": "ຊື້ດຽວນີ້",

    // About / Home
    "home.quickActions": "ທາງລັດ",
    "home.featuredProducts": "ສິນຄ້າແນະນຳ",
    "home.more": "ເພີ່ມເຕີມ",
    "home.services": "ທີ່ປຶກສາ IT ແລະ ບໍລິການ",
    "home.servicesDesc": "ການປະເມີນໂຄງສ້າງພື້ນຖານ, ການເຄື່ອນຍ້າຍຄລາວ, ສະໜັບສະໜູນ 24/7",
    "home.learnMore": "ສຶກສາເພີ່ມເຕີມ",
    "home.todaysDeals": "ດີນແດ່ມື້ນີ້",
    "home.stats.clients": "ລູກຄ້າ",
    "home.stats.support": "ສະໜັບສະໜູນ",
    "home.stats.sla": "SLA",
    "home.stats.partners": "ຄູ່ຮ່ວມ",
    "home.trustedPartners": "ຄູ່ຮ່ວມທີ່ເຊື່ອຖື",
    "home.getQuote": "ຂໍໃບສະເໜີລາຄາ",
    "home.liveChat": "ສົນທະນາສົດ",
    "home.deals": "ດີນ",
    "home.6services": "6 ບໍລິການ",

    // Shop
    "shop.title": "ຮ້ານຄ້າ",
    "shop.subtitle": "ເບິ່ງອຸປະກອນ, ຊອບແວ, ແລະ ແພັກເກັດບໍລິການສຳລັບວິສາຫະກິດ.",
    "shop.search": "ຄົ້ນຫາສິນຄ້າ...",
    "shop.inStockOnly": "ມີໃນສະຕ໊ອກເທົ່ານັ້ນ",
    "shop.price": "ລາຄາ",
    "shop.addToCart": "ເພີ່ມໃສ່ກະຕ່າ",
    "shop.outOfStock": "ໝົດສະຕ໊ອກ",
    "shop.noProducts": "ບໍ່ພົບສິນຄ້າທີ່ກົງກັບເງື່ອນໄຂຂອງທ່ານ.",
    "shop.product": "ສິນຄ້າ",
    "shop.products": "ສິນຄ້າ",

    // Product Detail
    "product.backToShop": "ກັບໄປຮ້ານຄ້າ",
    "product.inStock": "ມີໃນສະຕ໊ອກ",
    "product.outOfStock": "ໝົດສະຕ໊ອກ",
    "product.quantity": "ຈຳນວນ:",
    "product.addToCart": "ເພີ່ມໃສ່ກະຕ່າ",
    "product.specifications": "ລາຍລະອຽດ",
    "product.notFound": "ບໍ່ພົບສິນຄ້າ.",

    // Cart
    "cart.title": "ກະຕ່າ",
    "cart.items": "ລາຍການ",
    "cart.item": "ລາຍການ",
    "cart.empty": "ກະຕ່າຂອງທ່ານວ່າງເປົ່າ",
    "cart.emptyDesc": "ເບິ່ງສິນຄ້າຂອງພວກເຮົາແລະເພີ່ມສິ່ງທີ່ທ່ານຕ້ອງການ.",
    "cart.browseShop": "ເບິ່ງຮ້ານຄ້າ",
    "cart.continueShopping": "ຊື້ເພີ່ມ",
    "cart.total": "ລວມ",
    "cart.checkout": "ດຳເນີນການຊຳລະ",
    "cart.checkoutTitle": "ຊຳລະເງິນ",
    "cart.fullName": "ຊື່ເຕັມ",
    "cart.phone": "ເບີໂທ",
    "cart.email": "ອີເມວ",
    "cart.address": "ທີ່ຢູ່ຈັດສົ່ງ",
    "cart.notes": "ໝາຍເຫດ",
    "cart.placeOrder": "ສັ່ງຊື້",
    "cart.each": "ແຕ່ລະ",
    "cart.orderSuccess": "ສັ່ງຊື້ສຳເລັດ! ພວກເຮົາຈະຕິດຕໍ່ທ່ານໃນໄວໆນີ້.",
    "cart.step.info": "ຂໍ້ມູນລູກຄ້າ",
    "cart.step.delivery": "ການຈັດສົ່ງ",
    "cart.step.payment": "ການຊຳລະ",
    "cart.next": "ຕໍ່ໄປ",
    "cart.back": "ກັບຄືນ",
    "cart.deliveryMethod": "ວິທີການຈັດສົ່ງ",
    "cart.pickup": "ຮັບເອງທີ່ຫ້ອງການ",
    "cart.pickupDesc": "ຟຣີ — ມາຮັບທີ່ຫ້ອງການ",
    "cart.delivery": "ຈັດສົ່ງ",
    "cart.deliveryDesc": "ຄ່າສົ່ງລາຄາດຽວ",
    "cart.deliveryFee": "ຄ່າຈັດສົ່ງ",
    "cart.free": "ຟຣີ",
    "cart.grandTotal": "ລວມທັງໝົດ",
    "cart.subtotal": "ລວມຍ່ອຍ",
    "cart.paymentTitle": "ການຊຳລະ",
    "cart.paymentDesc": "ສະແກນ QR ລຸ່ມນີ້ເພື່ອຊຳລະ, ຈາກນັ້ນອັບໂຫຼດຮູບພາບໃບບິນ.",
    "cart.qrPlaceholder": "QR code ຈະມີໃນໄວໆນີ້",
    "cart.uploadScreenshot": "ອັບໂຫຼດໃບບິນການຊຳລະ",
    "cart.uploadedScreenshot": "ອັບໂຫຼດແລ້ວ",
    "cart.changeScreenshot": "ປ່ຽນ",
    "cart.submitOrder": "ສົ່ງຄຳສັ່ງຊື້",
    "cart.screenshotRequired": "ກະລຸນາອັບໂຫຼດໃບບິນການຊຳລະ",
    "cart.loginRequired": "ກະລຸນາເຂົ້າສູ່ລະບົບເພື່ອສັ່ງຊື້",

    // Services
    "services.badge": "ບໍລິການວິຊາຊີບ",
    "services.title": "ບໍລິການ IT ແລະ ທີ່ປຶກສາ",
    "services.subtitle": "ຈາກການກວດສອບໂຄງສ້າງພື້ນຖານຈົນເຖິງ IT ທີ່ຄຸ້ມຄອງເຕັມຮູບແບບ — ພວກເຮົາຊ່ວຍທຸລະກິດດຳເນີນງານຢ່າງໜ້າເຊື່ອຖື ແລະ ປອດໄພ.",
    "services.requestQuote": "ຂໍໃບສະເໜີລາຄາຟຣີ",
    "services.whatWeOffer": "ສິ່ງທີ່ພວກເຮົາສະເໜີ",
    "services.quoteTitle": "ຂໍໃບສະເໜີລາຄາ",
    "services.quoteSubtitle": "ບອກພວກເຮົາກ່ຽວກັບໂຄງການຂອງທ່ານ ແລະ ພວກເຮົາຈະຕອບກັບພາຍໃນ 24 ຊົ່ວໂມງ.",
    "services.notSure": "ບໍ່ແນ່ໃຈວ່າຕ້ອງການຫຍັງ?",
    "services.notSureDesc": "ວິສະວະກອນຂາຍຂອງພວກເຮົາສາມາດຊ່ວຍທ່ານຊອກຫາການລວມຕົວທີ່ເໝາະສົມ.",
    "services.chatWithSales": "ສົນທະນາກັບຝ່າຍຂາຍ",
    "services.name": "ຊື່",
    "services.email": "ອີເມວ",
    "services.phone": "ເບີໂທ",
    "services.company": "ບໍລິສັດ",
    "services.serviceType": "ປະເພດບໍລິການ",
    "services.selectService": "ເລືອກບໍລິການ...",
    "services.budget": "ລະດັບງົບປະມານ",
    "services.select": "ເລືອກ...",
    "services.timeline": "ໄລຍະເວລາ",
    "services.projectDetails": "ລາຍລະອຽດໂຄງການ",
    "services.projectPlaceholder": "ອະທິບາຍຄວາມຕ້ອງການໂຄງການຂອງທ່ານ...",
    "services.submitQuote": "ສົ່ງຄຳຂໍໃບສະເໜີ",
    "services.quoteSuccess": "ສົ່ງຄຳຂໍສຳເລັດ! ທີມງານຈະຕິດຕໍ່ທ່ານພາຍໃນ 24 ຊົ່ວໂມງ.",
    "services.fillRequired": "ກະລຸນາຕື່ມຂໍ້ມູນທີ່ຈຳເປັນ.",

    // Contact
    "contact.title": "ຕິດຕໍ່ຝ່າຍຂາຍ",
    "contact.subtitle": "ຕິດຕໍ່ທີມງານຂອງພວກເຮົາ. ພວກເຮົາມັກຈະຕອບພາຍໃນ 1 ຊົ່ວໂມງ.",
    "contact.preferredTime": "ເວລາຕິດຕໍ່ທີ່ຕ້ອງການ",
    "contact.timePlaceholder": "ເຊັ່ນ, 9 ໂມງ - 12 ໂມງ",
    "contact.message": "ຂໍ້ຄວາມ",
    "contact.sendMessage": "ສົ່ງຂໍ້ຄວາມ",
    "contact.success": "ຂໍ້ຄວາມຂອງທ່ານຖືກສົ່ງແລ້ວ! ທີມງານຈະຕິດຕໍ່ກັບໃນໄວໆນີ້.",
    "contact.fillRequired": "ກະລຸນາຕື່ມຂໍ້ມູນທີ່ຈຳເປັນ",

    // Profile
    "profile.welcome": "ຍິນດີຕ້ອນຮັບສູ່ Champa",
    "profile.signInDesc": "ເຂົ້າສູ່ລະບົບເພື່ອເບິ່ງຄຳສັ່ງຊື້, ຈັດການໂປຣໄຟລ໌, ແລະ ເຂົ້າເຖິງຄຸນສົມບັດພິເສດ.",
    "profile.signIn": "ເຂົ້າສູ່ລະບົບ",
    "profile.createAccount": "ສ້າງບັນຊີ",
    "profile.hello": "ສະບາຍດີ",
    "profile.orders": "ຄຳສັ່ງຊື້",
    "profile.ordersDesc": "ຕິດຕາມ ແລະ ຈັດການ",
    "profile.wishlist": "ລາຍການທີ່ມັກ",
    "profile.wishlistDesc": "ລາຍການທີ່ບັນທຶກໄວ້",
    "profile.addresses": "ທີ່ຢູ່",
    "profile.addressesDesc": "ຂໍ້ມູນການຈັດສົ່ງ",
    "profile.payments": "ການຊຳລະ",
    "profile.paymentsDesc": "ບັດ ແລະ ໃບບິນ",
    "profile.adminPortal": "ປະຕູຜູ້ດູແລ",
    "profile.adminPortalDesc": "ຈັດການສິນຄ້າ, ຄຳສັ່ງ ແລະ ອື່ນໆ",
    "profile.itemsInCart": "ລາຍການໃນກະຕ່າ",
    "profile.itemInCart": "ລາຍການໃນກະຕ່າ",
    "profile.account": "ບັນຊີ",
    "profile.accountSettings": "ການຕັ້ງຄ່າບັນຊີ",
    "profile.helpSupport": "ຊ່ວຍເຫຼືອ ແລະ ສະໜັບສະໜູນ",
    "profile.buyAgain": "ຊື້ອີກ",
    "profile.signOut": "ອອກຈາກລະບົບ",
    "profile.language": "ພາສາ",
    "profile.languageDesc": "ເລືອກພາສາທີ່ທ່ານຕ້ອງການ",

    // Auth
    "auth.signInTitle": "ເຂົ້າສູ່ບັນຊີຂອງທ່ານ",
    "auth.signUpTitle": "ສ້າງບັນຊີໃໝ່",
    "auth.resetTitle": "ຕັ້ງລະຫັດຜ່ານໃໝ່",
    "auth.signInTab": "ເຂົ້າສູ່ລະບົບ",
    "auth.signUpTab": "ລົງທະບຽນ",
    "auth.email": "ອີເມວ",
    "auth.password": "ລະຫັດຜ່ານ",
    "auth.fullName": "ຊື່ເຕັມ",
    "auth.forgotPassword": "ລືມລະຫັດຜ່ານ?",
    "auth.signInBtn": "ເຂົ້າສູ່ລະບົບ",
    "auth.signUpBtn": "ສ້າງບັນຊີ",
    "auth.sendResetLink": "ສົ່ງລິ້ງຕັ້ງລະຫັດໃໝ່",
    "auth.backToSignIn": "ກັບໄປເຂົ້າສູ່ລະບົບ",
    "auth.adminCheckbox": "ລົງທະບຽນເປັນຜູ້ດູແລ Champa",
    "auth.adminCheckboxDesc": "ຂໍການເຂົ້າເຖິງຜູ້ດູແລ (ຕ້ອງໄດ້ຮັບອະນຸມັດ)",
    "auth.adminReason": "ເຫດຜົນທີ່ຕ້ອງການເຂົ້າເຖິງຜູ້ດູແລ",
    "auth.adminReasonPlaceholder": "ອະທິບາຍວ່າເປັນຫຍັງທ່ານຈຶ່ງຕ້ອງການການເຂົ້າເຖິງຜູ້ດູແລ...",
    "auth.welcomeBack": "ຍິນດີຕ້ອນຮັບກັບຄືນ!",
    "auth.checkEmail": "ກວດສອບອີເມວຂອງທ່ານເພື່ອຢືນຢັນບັນຊີ!",
    "auth.resetSent": "ສົ່ງອີເມວຕັ້ງລະຫັດຜ່ານໃໝ່ແລ້ວ!",
    "auth.minPassword": "ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ",

    // Notifications
    "notifications.title": "ການແຈ້ງເຕືອນ",
    "notifications.subtitle": "ການແຈ້ງເຕືອນຂອງທ່ານຈະປະກົດຢູ່ນີ້",
    "notifications.empty": "ຍັງບໍ່ມີການແຈ້ງເຕືອນ",
    "notifications.emptyDesc": "ເຂົ້າສູ່ລະບົບເພື່ອຮັບການອັບເດດຄຳສັ່ງ ແລະ ຂໍ້ຄວາມ",

    // Footer
    "footer.tagline": "ບໍລິການດ້ວຍໃຈ ລາຄາສົມເຫດສົມຜົນ. ຄູ່ຮ່ວມທີ່ໜ້າເຊື່ອຖືຂອງທ່ານສຳລັບການແກ້ໄຂເທັກໂນໂລຢີ.",
    "footer.products": "ສິນຄ້າ",
    "footer.serversHardware": "ເຊີບເວີ ແລະ ຮາດແວ",
    "footer.networking": "ເຄືອຂ່າຍ",
    "footer.security": "ຄວາມປອດໄພ",
    "footer.software": "ຊອບແວ",
    "footer.services": "ບໍລິການ",
    "footer.itConsulting": "ທີ່ປຶກສາ IT",
    "footer.cloudMigration": "ການເຄື່ອນຍ້າຍຄລາວ",
    "footer.managedIT": "ບໍລິການ IT",
    "footer.getAQuote": "ຂໍໃບສະເໜີ",
    "footer.company": "ບໍລິສັດ",
    "footer.aboutUs": "ກ່ຽວກັບພວກເຮົາ",
    "footer.contactSales": "ຕິດຕໍ່ຝ່າຍຂາຍ",
    "footer.myProfile": "ໂປຣໄຟລ໌ຂອງຂ້ອຍ",
    "footer.rights": "ສະຫງວນລິຂະສິດ.",

    // Support
    "support.liveAgent": "ຕົວແທນສົດ",
    "support.chatWithSupport": "ສົນທະນາກັບຝ່າຍສະໜັບສະໜູນ",
    "support.contactSales": "ຕິດຕໍ່ຝ່າຍຂາຍ",
    "support.getAQuote": "ຂໍໃບສະເໜີ",
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem("champa_language");
    return (stored === "lo" ? "lo" : "en") as Language;
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("champa_language", lang);
  }, []);

  const t = useCallback((key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
