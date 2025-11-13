// ===== CART LOGIC =====
let cart = JSON.parse(localStorage.getItem('orbis_cart')) || [];

// PERUBAHAN: Fungsi untuk format harga tanpa desimal (Rp 30.000)
function formatPrice(amount) {
  // Convert to string and format with dots instead of commas
  const formatted = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Rp ${formatted}`;
}

function updateCart() {
  localStorage.setItem('orbis_cart', JSON.stringify(cart));
  const cartCountElements = document.querySelectorAll('.cart-count');
  cartCountElements.forEach(element => {
    element.textContent = cart.length;
  });
  document.getElementById('cart-count-modal').textContent = cart.length;
}

// Add to cart
document.querySelectorAll('.orbit-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const flavor = btn.dataset.flavor;
    const price = parseInt(btn.dataset.price);
    
    const existing = cart.find(item => item.flavor === flavor);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ flavor, price, qty: 1 });
    }
    updateCart();
    
    // Visual feedback
    const original = btn.innerHTML;
    btn.innerHTML = '✓ ORBITED!';
    btn.style.background = '#4CAF50';
    btn.style.boxShadow = '0 0 20px rgba(76, 175, 80, 0.6)';
    
    setTimeout(() => {
      btn.innerHTML = original;
      btn.style.background = '';
      btn.style.boxShadow = '';
    }, 1500);
  });
});

// ===== SMOOTH SCROLL NAV =====
function scrollToSection(targetId) {
  const target = document.querySelector(targetId);
  if (target) {
    window.scrollTo({
      top: target.offsetTop - 72,
      behavior: 'smooth'
    });
    // Close mobile menu if open
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu && mobileMenu.classList.contains('active')) {
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
}

document.querySelectorAll('nav a').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    scrollToSection(targetId);
  });
});

// Also add event listeners for mobile menu links
document.querySelectorAll('.mobile-menu a').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    scrollToSection(targetId);
  });
});

// ===== LAUNCH BUTTON SCROLL TO FIRST PRODUCT =====
document.getElementById('launch-btn').addEventListener('click', () => {
  const firstProduct = document.getElementById('crimson');
  if (firstProduct) {
    window.scrollTo({
      top: firstProduct.offsetTop - 72,
      behavior: 'smooth'
    });
  }
});

// ===== CART MODAL =====
const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const modalOverlay = document.getElementById('modal-overlay');
const closeCart = document.getElementById('close-cart');

cartBtn.addEventListener('click', () => openModal(cartModal));

function openModal(modal) {
  modal.classList.add('show');
  modalOverlay.style.display = 'block';
  document.body.style.overflow = 'hidden';
  renderCart(); // Render cart when opening
}

function closeModal() {
  cartModal.classList.remove('show');
  modalOverlay.style.display = 'none';
  document.body.style.overflow = '';
}

[closeCart, modalOverlay].forEach(el => {
  el.addEventListener('click', closeModal);
});

// Render cart items
function renderCart() {
  const cartItems = document.getElementById('cart-items');
  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-cart-container">
        <p class="empty-text">Your cart is empty. Explore our cosmic flavors and add some items!</p>
        <button class="btn-primary" id="explore-products-btn" style="margin: 1rem auto; display: block; max-width: 200px;">Explore Products</button>
      </div>
    `;
    
    // Add event listener to the explore button
    document.getElementById('explore-products-btn').addEventListener('click', () => {
      closeModal();
      // Small delay to ensure modal is closed before scrolling
      setTimeout(() => {
        // Scroll to the crimson product section
        const crimsonSection = document.getElementById('crimson');
        if (crimsonSection) {
          window.scrollTo({
            top: crimsonSection.offsetTop - 72,
            behavior: 'smooth'
          });
          
          // Trigger the animation for the crimson section
          setTimeout(() => {
            showCanAnimation(crimsonSection);
          }, 500);
        }
      }, 300);
    });
    
    // Add empty class to cart summary
    document.querySelector('.cart-summary').classList.add('empty');
    
    // PERUBAHAN: Gunakan formatPrice
    document.getElementById('subtotal').textContent = formatPrice(0);
    document.getElementById('total').textContent = formatPrice(0);
    return;
  }

  const itemsHTML = cart.map(item => {
    const product = { name: item.flavor, price: item.price };
    // PERUBAHAN: Gunakan formatPrice
    const total = formatPrice(product.price * item.qty);
    
    // Determine which can image to use based on flavor
    let canImage = 'https://via.placeholder.com/40?text=Can';
    if (item.flavor.includes('Crimson')) {
      canImage = 'assets/images/crimson-can.png';
    } else if (item.flavor.includes('Solar')) {
      canImage = 'assets/images/zest-can.png';
    } else if (item.flavor.includes('Nova')) {
      canImage = 'assets/images/bloom-can.png';
    } else if (item.flavor.includes('Titan')) {
      canImage = 'assets/images/peel-can.png';
    }
    
    return `
      <div class="cart-item">
        <img src="${canImage}" alt="${product.name}">
        <div class="item-info">
          <div class="item-name">${product.name}</div>
          <div class="item-price">${formatPrice(product.price)}</div>
        </div>
        <div class="item-qty">
          <button class="qty-btn dec" data-id="${item.flavor}">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn inc" data-id="${item.flavor}">+</button>
        </div>
        <div class="item-total">${total}</div>
        <button class="remove-btn" data-id="${item.flavor}">×</button>
      </div>
    `;
  }).join('');

  cartItems.innerHTML = itemsHTML;
  
  // Remove empty class from cart summary
  document.querySelector('.cart-summary').classList.remove('empty');

  // Hitung total
  const subtotal = cart.reduce((sum, item) => {
    const p = { price: item.price };
    return sum + (p.price * item.qty);
  }, 0);
  
  // PERUBAHAN: Gunakan formatPrice
  document.getElementById('subtotal').textContent = formatPrice(subtotal);
  document.getElementById('total').textContent = formatPrice(subtotal);

  // Event listeners for qty & remove
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const isInc = e.target.classList.contains('inc');
      const item = cart.find(x => x.flavor === id);
      if (item) {
        item.qty = Math.max(1, item.qty + (isInc ? 1 : -1));
        if (item.qty === 0) {
          cart = cart.filter(x => x.flavor !== id);
        }
        updateCart();
        renderCart();
      }
    });
  });

  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      cart = cart.filter(x => x.flavor !== id);
      updateCart();
      renderCart();
    });
  });
}

// Clear & Checkout
document.getElementById('clear-cart').addEventListener('click', () => {
  cart = [];
  updateCart();
  renderCart();
});

document.getElementById('checkout-btn').addEventListener('click', () => {
  if (cart.length === 0) {
    // Show empty cart modal instead of alert
    showEmptyCartModal();
    return;
  }
  // Show success modal instead of alert
  showSuccessModal();
});

// Function to show empty cart modal
function showEmptyCartModal() {
  // Create empty cart modal HTML
  const emptyCartModal = `
    <div class="modal empty-cart-modal" id="empty-cart-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Your Cart is Empty</h3>
          <button class="close-btn" id="close-empty-cart">&times;</button>
        </div>
        <div class="modal-body">
          <div class="empty-cart-container">
            <p class="empty-text">Your cart is empty. Explore our cosmic flavors and add some items!</p>
            <button class="btn-primary" id="explore-from-empty" style="margin: 1rem auto; display: block; max-width: 200px;">Explore Products</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-overlay" id="empty-cart-overlay"></div>
  `;
  
  // Add to body
  document.body.insertAdjacentHTML('beforeend', emptyCartModal);
  
  // Add event listeners
  document.getElementById('close-empty-cart').addEventListener('click', closeEmptyCartModal);
  document.getElementById('empty-cart-overlay').addEventListener('click', closeEmptyCartModal);
  document.getElementById('explore-from-empty').addEventListener('click', () => {
    // Close both empty cart modal and main cart modal
    closeEmptyCartModal();
    closeModal(); // Close the main cart modal
    
    // Small delay to ensure modals are closed before scrolling
    setTimeout(() => {
      // Scroll to the crimson product section
      const crimsonSection = document.getElementById('crimson');
      if (crimsonSection) {
        window.scrollTo({
          top: crimsonSection.offsetTop - 72,
          behavior: 'smooth'
        });
        
        // Trigger the animation for the crimson section
        setTimeout(() => {
          showCanAnimation(crimsonSection);
        }, 500);
      }
    }, 300);
  });
  
  // Show modal
  document.getElementById('empty-cart-modal').classList.add('show');
  document.getElementById('empty-cart-overlay').style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeEmptyCartModal() {
  const modal = document.getElementById('empty-cart-modal');
  const overlay = document.getElementById('empty-cart-overlay');
  
  if (modal && overlay) {
    modal.classList.remove('show');
    overlay.style.display = 'none';
    document.body.style.overflow = '';
    
    // Remove modal after animation
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 300);
  }
}

// Function to show success modal
function showSuccessModal() {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const items = cart.length;
  
  // Update success modal content
  document.getElementById('success-total').textContent = formatPrice(total);
  document.getElementById('success-items').textContent = items;
  
  // Show modal
  document.getElementById('success-modal').classList.add('show');
  document.getElementById('success-overlay').style.display = 'block';
  document.body.style.overflow = 'hidden';
  
  // Clear cart
  cart = [];
  updateCart();
  renderCart();
}

// Close success modal
document.getElementById('close-success').addEventListener('click', () => {
  document.getElementById('success-modal').classList.remove('show');
  document.getElementById('success-overlay').style.display = 'none';
  document.body.style.overflow = '';
});

document.getElementById('success-overlay').addEventListener('click', () => {
  document.getElementById('success-modal').classList.remove('show');
  document.getElementById('success-overlay').style.display = 'none';
  document.body.style.overflow = '';
});

// ===== HEADER COLOR CHANGE ON SCROLL & ANIMATION LOGIC =====
let scrollTimeout;
function updateHeaderColor() {
  if (scrollTimeout) {
    window.cancelAnimationFrame(scrollTimeout);
  }
  
  scrollTimeout = requestAnimationFrame(() => {
    const sections = [
      { id: 'intro', class: 'intro' },
      { id: 'crimson', class: 'crimson' },
      { id: 'zest', class: 'solar' },
      { id: 'bloom', class: 'nova' },
      { id: 'peel', class: 'titan' }
    ];
    
    const viewportMiddle = window.scrollY + (window.innerHeight / 2);
    let currentClass = 'intro';
    
    sections.forEach(({ id, class: className }) => {
      const section = document.getElementById(id);
      if (section) {
        const rect = section.getBoundingClientRect();
        const sectionTop = window.scrollY + rect.top;
        const sectionBottom = sectionTop + rect.height;
        
        if (viewportMiddle >= sectionTop && viewportMiddle <= sectionBottom) {
          currentClass = className;
        }
      }
    });
    
    const header = document.getElementById('main-header');
    header.className = '';
    header.classList.add(currentClass);
  });
}

window.addEventListener('scroll', updateHeaderColor);

// ===== SHOW CAN ANIMATION (Tetap Sama) =====
function showCanAnimation(section) {
  if (!section) return;
  
  // Hide semua elemen dulu
  const allSections = document.querySelectorAll('.hero');
  allSections.forEach(sec => {
    sec.querySelectorAll('.can-image, .orbit-btn, .title-text, .fruit, .background-layer, .reflective-surface').forEach(el => {
      el.classList.remove('show');
    });
  });
  
  // Show background layer
  const bgLayer = section.querySelector('.background-layer');
  if (bgLayer) {
    setTimeout(() => {
      bgLayer.classList.add('show');
    }, 100);
  }
  
  // Show reflective surface
  const reflective = section.querySelector('.reflective-surface');
  if (reflective) {
    setTimeout(() => {
      reflective.classList.add('show');
    }, 200);
  }
  
  // Show title text 1
  const title1 = section.querySelector('.title-text-1');
  if (title1) {
    setTimeout(() => {
      title1.classList.add('show');
    }, 300);
  }
  
  // Show title text 2
  const title2 = section.querySelector('.title-text-2');
  if (title2) {
    setTimeout(() => {
      title2.classList.add('show');
    }, 400);
  }
  
  // Show can image
  const canImage = section.querySelector('.can-image');
  if (canImage) {
    setTimeout(() => {
      canImage.classList.add('show');
    }, 500);
  }
  
  // Tampilkan fruits langsung besar (semua sekaligus)
  const fruits = section.querySelectorAll('.fruit');
  fruits.forEach((fruit) => {
    setTimeout(() => {
      fruit.classList.add('show');
    }, 600);
  });
  
  // Tampilkan button - pastikan selalu terlihat
  const orbitBtn = section.querySelector('.orbit-btn');
  if (orbitBtn) {
    setTimeout(() => {
      orbitBtn.classList.add('show');
    }, 800);
  }
}

function checkAndShowCan() {
  const sections = ['crimson', 'zest', 'bloom', 'peel'];
  sections.forEach(id => {
    const section = document.getElementById(id);
    if (section) {
      const rect = section.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      if (isVisible) {
        showCanAnimation(section);
      }
    }
  });
}

window.addEventListener('scroll', checkAndShowCan);

// Update saat load dan resize
window.addEventListener('load', () => {
  updateHeaderColor();
  checkAndShowCan();
});
window.addEventListener('resize', () => {
  updateHeaderColor();
  checkAndShowCan();
});

// Launch button scroll to first product dengan animation
document.getElementById('launch-btn').addEventListener('click', () => {
  const firstProduct = document.getElementById('crimson');
  if (firstProduct) {
    window.scrollTo({
      top: firstProduct.offsetTop - 72,
      behavior: 'smooth'
    });
    setTimeout(() => {
      showCanAnimation(firstProduct);
    }, 500);
  }
});

// ===== RATING SYSTEM =====
let currentRating = 0;

const ratingStars = document.querySelector('.rating-stars');
if (ratingStars) {
  ratingStars.querySelectorAll('i').forEach((star, index) => {
    star.addEventListener('click', () => {
      const rating = index + 1;
      
      // If clicking the same star, unstar it
      if (currentRating === rating) {
        // Cancel the rating
        currentRating = 0;
        
        // Reset stars
        ratingStars.querySelectorAll('i').forEach(s => {
          s.classList.remove('rated', 'active');
        });
        
        // Reset text
        const ratingText = document.querySelector('.rating-text');
        if (ratingText) {
          ratingText.textContent = 'Click to rate';
          ratingText.style.color = '';
        }
        
        // Remove from localStorage
        localStorage.removeItem('orbis_rating');
      } else {
        // Set new rating
        currentRating = rating;
        
        // Update stars
        ratingStars.querySelectorAll('i').forEach((s, i) => {
          if (i < rating) {
            s.classList.add('rated', 'active');
          } else {
            s.classList.remove('rated', 'active');
          }
        });
        
        // Update text
        const ratingText = document.querySelector('.rating-text');
        if (ratingText) {
          ratingText.textContent = `Thank you for ${rating} star${rating > 1 ? 's' : ''}!`;
          ratingText.style.color = '#FFD700';
        }
        
        // Save to localStorage
        localStorage.setItem('orbis_rating', rating);
      }
    });
    
    star.addEventListener('mouseenter', () => {
      const rating = index + 1;
      ratingStars.querySelectorAll('i').forEach((s, i) => {
        if (i < rating) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      });
    });
  });
  

  
  // Load saved rating
  ratingStars.addEventListener('mouseleave', () => {
    if (currentRating === 0) {
      ratingStars.querySelectorAll('i').forEach(s => {
        s.classList.remove('active');
      });
    } else {
      ratingStars.querySelectorAll('i').forEach((s, i) => {
        if (i < currentRating) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      });
    }
  });

  // Load saved rating on page load
  const savedRating = localStorage.getItem('orbis_rating');
  if (savedRating) {
    currentRating = parseInt(savedRating);
    ratingStars.querySelectorAll('i').forEach((s, i) => {
      if (i < currentRating) {
        s.classList.add('rated', 'active');
      }
    });
  }
}

// ===== MOBILE MENU =====
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const closeMenuBtn = document.getElementById('close-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn && closeMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
  
  closeMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  });
  
  // Close menu when clicking on links
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      scrollToSection(targetId);
      // Close menu after navigation
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// Close mobile menu when window is resized to desktop size
window.addEventListener('resize', () => {
  if (window.innerWidth > 768 && mobileMenu && mobileMenu.classList.contains('active')) {
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// ===== INIT =====
updateCart();
renderCart();