const header = document.getElementById("siteHeader");
const topProgress = document.getElementById("topProgress");
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const productType = document.getElementById("productType");
const quantity = document.getElementById("quantity");
const resultProduct = document.getElementById("resultProduct");
const resultUnit = document.getElementById("resultUnit");
const resultQty = document.getElementById("resultQty");
const resultTotal = document.getElementById("resultTotal");
const copyQuote = document.getElementById("copyQuote");
const toast = document.getElementById("toast");

const pricing = {
  windows: {
    name: "Windows 10 / 11 Retail",
    under10: 899000,
    over10: 799000,
    suffix: "/key",
  },
  office: {
    name: "Office 365 E5 Developer",
    under10: 599000,
    over10: 499000,
    suffix: "/năm",
  },
};

function formatVND(value) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

function getQuote() {
  const type = productType.value;
  const qty = Math.max(1, Number(quantity.value || 1));
  const item = pricing[type];
  const unit = qty >= 10 ? item.over10 : item.under10;
  const total = unit * qty;

  return { type, qty, item, unit, total };
}

function updateQuote() {
  const quote = getQuote();
  resultProduct.textContent = quote.item.name;
  resultUnit.textContent = formatVND(quote.unit) + quote.item.suffix;
  resultQty.textContent = quote.qty + " key";
  resultTotal.textContent = formatVND(quote.total);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-show");
  setTimeout(() => toast.classList.remove("is-show"), 2200);
}

window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  topProgress.style.width = percent + "%";
  header.classList.toggle("is-scrolled", scrollTop > 10);
});

menuToggle.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("is-open");
  menuToggle.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("is-open");
    menuToggle.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll(".faq-question").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const content = item.querySelector(".faq-content");
    const isOpen = item.classList.toggle("is-open");
    content.style.maxHeight = isOpen ? content.scrollHeight + "px" : 0;
  });
});

productType.addEventListener("change", updateQuote);
quantity.addEventListener("input", updateQuote);

copyQuote.addEventListener("click", async () => {
  const quote = getQuote();
  const text = `Báo giá ${quote.item.name}: số lượng ${quote.qty} key, đơn giá ${formatVND(quote.unit)}${quote.item.suffix}, tổng dự kiến ${formatVND(quote.total)}. Có hỗ trợ xuất hóa đơn và tư vấn kích hoạt.`;

  try {
    await navigator.clipboard.writeText(text);
    showToast("Đã copy báo giá");
  } catch (error) {
    showToast("Trình duyệt chưa cho phép copy");
  }
});

document.getElementById("year").textContent = new Date().getFullYear();
updateQuote();

// form submission with Google Sheets API

const handleSubmitForm = () => {
  const form = document.getElementById("licenseLeadForm");
  const formMessage = document.getElementById("licenseFormMessage");

  const GOOGLE_SHEET_API =
    "https://script.google.com/macros/s/AKfycbwPSP-7AqkZJzWYM3KygG-WM8A0WcCUG8m9Vr-CFO9xe3BpbPer555AqbEsZl5ssuWFNg/exec";

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const oldText = submitBtn.textContent;

    const data = {
      customer_name: form.querySelector('[name="customer_name"]').value.trim(),
      customer_phone: form
        .querySelector('[name="customer_phone"]')
        .value.trim(),
      product_need: form.querySelector('[name="product_need"]').value,
      expected_quantity: form.querySelector('[name="expected_quantity"]').value,
      customer_note: form.querySelector('[name="customer_note"]').value.trim(),
    };

    console.log("DATA GỬI ĐI:", data);

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = "Đang gửi...";

      await fetch(GOOGLE_SHEET_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify(data),
      });

      formMessage.textContent =
        "Gửi thông tin thành công. Chúng tôi sẽ liên hệ sớm.";
      formMessage.className = "form-message success";

      form.reset();
    } catch (error) {
      console.error("Lỗi gửi form:", error);

      formMessage.textContent = "Không gửi được thông tin. Vui lòng thử lại.";
      formMessage.className = "form-message error";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = oldText;
    }
  });
};

document.addEventListener("DOMContentLoaded", handleSubmitForm);
