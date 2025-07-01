// ===== Global Variables =====
let currentLanguage = 'ar';
let currentTheme = 'light';

// ===== DOM Elements =====
const elements = {
    loadingScreen: document.getElementById('loading-screen'),
    navbar: document.getElementById('navbar'),
    navMenu: document.getElementById('nav-menu'),
    hamburger: document.getElementById('hamburger'),
    langToggle: document.getElementById('lang-toggle'),
    langText: document.getElementById('lang-text'),
    themeToggle: document.getElementById('theme-toggle'),
    backToTop: document.getElementById('back-to-top'),
    contactForm: document.getElementById('contact-form'),
    skillBars: document.querySelectorAll('.skill-progress'),
    navLinks: document.querySelectorAll('.nav-link')
};

// ===== Language Data =====
const translations = {
    ar: {
        direction: 'rtl',
        font: 'Tajawal'
    },
    en: {
        direction: 'ltr',
        font: 'Poppins'
    }
};

// ===== Utility Functions =====
const utils = {
    // Smooth scroll to element
    scrollToElement: (elementId) => {
        const element = document.getElementById(elementId);
        if (element) {
            const offsetTop = element.offsetTop - 70; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    },

    // Throttle function for performance
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    },

    // Debounce function for performance
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Check if element is in viewport
    isInViewport: (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    // Animate number counting
    animateNumber: (element, start, end, duration) => {
        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(start + (end - start) * progress);
            element.textContent = current + (element.textContent.includes('%') ? '%' : '+');
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }
};

// ===== Loading Screen =====
const loadingScreen = {
    init: () => {
        // Hide loading screen after page load
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (elements.loadingScreen) {
                    elements.loadingScreen.classList.add('hidden');
                    setTimeout(() => {
                        elements.loadingScreen.style.display = 'none';
                    }, 500);
                }
            }, 1000);
        });
    }
};

// ===== Navigation =====
const navigation = {
    init: () => {
        navigation.setupScrollEffect();
        navigation.setupMobileMenu();
        navigation.setupSmoothScrolling();
        navigation.setupActiveLinks();
    },

    setupScrollEffect: () => {
        const handleScroll = utils.throttle(() => {
            if (window.scrollY > 50) {
                elements.navbar.classList.add('scrolled');
            } else {
                elements.navbar.classList.remove('scrolled');
            }
        }, 100);

        window.addEventListener('scroll', handleScroll);
    },

    setupMobileMenu: () => {
        if (elements.hamburger && elements.navMenu) {
            elements.hamburger.addEventListener('click', () => {
                elements.hamburger.classList.toggle('active');
                elements.navMenu.classList.toggle('active');
            });

            // Close mobile menu when clicking on a link
            elements.navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    elements.hamburger.classList.remove('active');
                    elements.navMenu.classList.remove('active');
                });
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!elements.navbar.contains(e.target)) {
                    elements.hamburger.classList.remove('active');
                    elements.navMenu.classList.remove('active');
                }
            });
        }
    },

    setupSmoothScrolling: () => {
        elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                utils.scrollToElement(targetId);
            });
        });
    },

    setupActiveLinks: () => {
        const sections = document.querySelectorAll('section[id]');
        
        const handleScroll = utils.throttle(() => {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100;
                const sectionHeight = section.clientHeight;
                
                if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                    current = section.getAttribute('id');
                }
            });

            elements.navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        }, 100);

        window.addEventListener('scroll', handleScroll);
    }
};

// ===== Language Toggle =====
const languageToggle = {
    init: () => {
        // Load saved language preference
        const savedLanguage = localStorage.getItem('portfolio-language') || 'ar';
        languageToggle.setLanguage(savedLanguage);

        // Setup language toggle button
        if (elements.langToggle) {
            elements.langToggle.addEventListener('click', languageToggle.toggle);
        }
    },

    toggle: () => {
        const newLanguage = currentLanguage === 'ar' ? 'en' : 'ar';
        languageToggle.setLanguage(newLanguage);
    },

    setLanguage: (language) => {
        currentLanguage = language;
        
        // Update HTML attributes
        document.documentElement.lang = language;
        document.documentElement.dir = translations[language].direction;
        
        // Update body class for font family
        document.body.className = document.body.className.replace(/lang-\w+/, '');
        document.body.classList.add(`lang-${language}`);
        
        // Update language toggle button text
        if (elements.langText) {
            elements.langText.textContent = language === 'ar' ? 'EN' : 'ع';
        }
        
        // Update all translatable elements
        const translatableElements = document.querySelectorAll('[data-ar][data-en]');
        translatableElements.forEach(element => {
            const text = element.getAttribute(`data-${language}`);
            if (text) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = text;
                } else {
                    element.textContent = text;
                }
            }
        });
        
        // Save language preference
        localStorage.setItem('portfolio-language', language);
        
        // Trigger custom event for language change
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language } }));
    }
};

// ===== Theme Toggle =====
const themeToggle = {
    init: () => {
        // Load saved theme preference
        const savedTheme = localStorage.getItem('portfolio-theme') || 'light';
        themeToggle.setTheme(savedTheme);

        // Setup theme toggle button
        if (elements.themeToggle) {
            elements.themeToggle.addEventListener('click', themeToggle.toggle);
        }
    },

    toggle: () => {
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        themeToggle.setTheme(newTheme);
    },

    setTheme: (theme) => {
        currentTheme = theme;
        
        // Update HTML attribute
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update theme toggle button icon
        if (elements.themeToggle) {
            const icon = elements.themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            }
        }
        
        // Save theme preference
        localStorage.setItem('portfolio-theme', theme);
        
        // Trigger custom event for theme change
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }
};

// ===== Back to Top Button =====
const backToTop = {
    init: () => {
        if (elements.backToTop) {
            // Show/hide button based on scroll position
            const handleScroll = utils.throttle(() => {
                if (window.scrollY > 300) {
                    elements.backToTop.classList.add('visible');
                } else {
                    elements.backToTop.classList.remove('visible');
                }
            }, 100);

            window.addEventListener('scroll', handleScroll);

            // Scroll to top when clicked
            elements.backToTop.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }
};

// ===== Skills Animation =====
const skillsAnimation = {
    init: () => {
        skillsAnimation.setupIntersectionObserver();
    },

    setupIntersectionObserver: () => {
        const skillsSection = document.getElementById('skills');
        if (!skillsSection) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    skillsAnimation.animateSkillBars();
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.3
        });

        observer.observe(skillsSection);
    },

    animateSkillBars: () => {
        elements.skillBars.forEach((bar, index) => {
            setTimeout(() => {
                const width = bar.getAttribute('data-width');
                bar.style.width = width + '%';
            }, index * 200);
        });
    }
};

// ===== Statistics Animation =====
const statisticsAnimation = {
    init: () => {
        statisticsAnimation.setupIntersectionObserver();
    },

    setupIntersectionObserver: () => {
        const aboutSection = document.getElementById('about');
        if (!aboutSection) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    statisticsAnimation.animateNumbers();
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });

        observer.observe(aboutSection);
    },

    animateNumbers: () => {
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach((element, index) => {
            setTimeout(() => {
                const text = element.textContent;
                const number = parseInt(text.replace(/\D/g, ''));
                const hasPlus = text.includes('+');
                const hasPercent = text.includes('%');
                
                utils.animateNumber(element, 0, number, 2000);
            }, index * 300);
        });
    }
};

// ===== Contact Form =====
const contactForm = {
    init: () => {
        if (elements.contactForm) {
            elements.contactForm.addEventListener('submit', contactForm.handleSubmit);
            contactForm.setupFormValidation();
        }
    },

    handleSubmit: (e) => {
        e.preventDefault();
        
        const formData = new FormData(elements.contactForm);
        const data = Object.fromEntries(formData);
        
        // Simulate form submission
        contactForm.showLoading();
        
        setTimeout(() => {
            contactForm.showSuccess();
            elements.contactForm.reset();
        }, 2000);
    },

    setupFormValidation: () => {
        const inputs = elements.contactForm.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                contactForm.validateField(input);
            });
            
            input.addEventListener('input', () => {
                contactForm.clearFieldError(input);
            });
        });
    },

    validateField: (field) => {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Remove existing error
        contactForm.clearFieldError(field);

        // Validation rules
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = currentLanguage === 'ar' ? 'هذا الحقل مطلوب' : 'This field is required';
        } else if (field.type === 'email' && value && !contactForm.isValidEmail(value)) {
            isValid = false;
            errorMessage = currentLanguage === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address';
        }

        if (!isValid) {
            contactForm.showFieldError(field, errorMessage);
        }

        return isValid;
    },

    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    showFieldError: (field, message) => {
        field.classList.add('error');
        
        let errorElement = field.parentNode.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'error-message';
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
    },

    clearFieldError: (field) => {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    },

    showLoading: () => {
        const submitBtn = elements.contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <span>${currentLanguage === 'ar' ? 'جاري الإرسال...' : 'Sending...'}</span>
        `;
        
        submitBtn.dataset.originalText = originalText;
    },

    showSuccess: () => {
        const submitBtn = elements.contactForm.querySelector('button[type="submit"]');
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
            <i class="fas fa-check"></i>
            <span>${currentLanguage === 'ar' ? 'تم الإرسال بنجاح!' : 'Message Sent!'}</span>
        `;
        
        setTimeout(() => {
            submitBtn.innerHTML = submitBtn.dataset.originalText;
        }, 3000);
    }
};

// ===== Animations =====
const animations = {
    init: () => {
        // Initialize AOS (Animate On Scroll)
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 1000,
                easing: 'ease-in-out',
                once: true,
                offset: 100
            });
        }
        
        animations.setupParallaxEffect();
        animations.setupHoverEffects();
    },

    setupParallaxEffect: () => {
        const parallaxElements = document.querySelectorAll('.floating-element');
        
        const handleScroll = utils.throttle(() => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach((element, index) => {
                const speed = 0.5 + (index * 0.1);
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        }, 16);

        window.addEventListener('scroll', handleScroll);
    },

    setupHoverEffects: () => {
        // Project cards hover effect
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Skill category hover effect
        const skillCategories = document.querySelectorAll('.skill-category');
        skillCategories.forEach(category => {
            category.addEventListener('mouseenter', () => {
                category.style.transform = 'translateY(-5px)';
            });
            
            category.addEventListener('mouseleave', () => {
                category.style.transform = 'translateY(0)';
            });
        });
    }
};

// ===== Performance Optimization =====
const performance = {
    init: () => {
        performance.lazyLoadImages();
        performance.preloadCriticalResources();
    },

    lazyLoadImages: () => {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    },

    preloadCriticalResources: () => {
        // Preload critical fonts
        const fontLinks = [
            'https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap',
            'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
        ];

        fontLinks.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = href;
            document.head.appendChild(link);
        });
    }
};

// ===== Error Handling =====
const errorHandler = {
    init: () => {
        window.addEventListener('error', errorHandler.handleError);
        window.addEventListener('unhandledrejection', errorHandler.handlePromiseRejection);
    },

    handleError: (event) => {
        console.error('JavaScript Error:', event.error);
        // You can add error reporting here
    },

    handlePromiseRejection: (event) => {
        console.error('Unhandled Promise Rejection:', event.reason);
        // You can add error reporting here
    }
};

// ===== Accessibility =====
const accessibility = {
    init: () => {
        accessibility.setupKeyboardNavigation();
        accessibility.setupFocusManagement();
        accessibility.setupScreenReaderSupport();
    },

    setupKeyboardNavigation: () => {
        // ESC key to close mobile menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                elements.hamburger.classList.remove('active');
                elements.navMenu.classList.remove('active');
            }
        });

        // Enter key for buttons
        const buttons = document.querySelectorAll('button, .btn');
        buttons.forEach(button => {
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });
        });
    },

    setupFocusManagement: () => {
        // Skip to main content link
        const skipLink = document.createElement('a');
        skipLink.href = '#main';
        skipLink.textContent = currentLanguage === 'ar' ? 'تخطي إلى المحتوى الرئيسي' : 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--primary-color);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 10000;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    },

    setupScreenReaderSupport: () => {
        // Add ARIA labels where needed
        const navToggle = elements.hamburger;
        if (navToggle) {
            navToggle.setAttribute('aria-label', currentLanguage === 'ar' ? 'فتح القائمة' : 'Open menu');
            navToggle.setAttribute('aria-expanded', 'false');
            
            navToggle.addEventListener('click', () => {
                const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
                navToggle.setAttribute('aria-expanded', !isExpanded);
            });
        }

        // Update ARIA labels on language change
        document.addEventListener('languageChanged', () => {
            accessibility.updateAriaLabels();
        });
    },

    updateAriaLabels: () => {
        const ariaElements = document.querySelectorAll('[data-aria-ar][data-aria-en]');
        ariaElements.forEach(element => {
            const ariaText = element.getAttribute(`data-aria-${currentLanguage}`);
            if (ariaText) {
                element.setAttribute('aria-label', ariaText);
            }
        });
    }
};

// ===== Main Initialization =====
const app = {
    init: () => {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', app.start);
        } else {
            app.start();
        }
    },

    start: () => {
        try {
            // Initialize all modules
            loadingScreen.init();
            navigation.init();
            languageToggle.init();
            themeToggle.init();
            backToTop.init();
            skillsAnimation.init();
            statisticsAnimation.init();
            contactForm.init();
            animations.init();
            performance.init();
            errorHandler.init();
            accessibility.init();

            console.log('Portfolio website initialized successfully!');
        } catch (error) {
            console.error('Error initializing portfolio:', error);
        }
    }
};

// ===== Start the application =====
app.init();

// ===== Export for testing (if needed) =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        utils,
        navigation,
        languageToggle,
        themeToggle,
        contactForm
    };
}

