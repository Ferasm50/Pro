// ===== Enhanced Global Variables =====
let currentLanguage = 'ar';
let currentTheme = 'light';
let isScrolling = false;
let animationFrameId = null;

// ===== Enhanced DOM Elements =====
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
    navLinks: document.querySelectorAll('.nav-link'),
    statNumbers: document.querySelectorAll('.stat-number'),
    projectCards: document.querySelectorAll('.project-card'),
    testimonialCards: document.querySelectorAll('.testimonial-card'),
    blogCards: document.querySelectorAll('.blog-card'),
    interestCategories: document.querySelectorAll('.interest-category')
};

// ===== Enhanced Language Data =====
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

// ===== Enhanced Utility Functions =====
const utils = {
    // Smooth scroll to element with offset
    scrollToElement: (elementId, offset = 80) => {
        const element = document.getElementById(elementId);
        if (element) {
            const offsetTop = element.offsetTop - offset;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    },

    // Enhanced throttle function
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

    // Enhanced debounce function
    debounce: (func, wait, immediate = false) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },

    // Check if element is in viewport with threshold
    isInViewport: (element, threshold = 0.1) => {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;
        
        const vertInView = (rect.top <= windowHeight * (1 - threshold)) && ((rect.top + rect.height) >= windowHeight * threshold);
        const horInView = (rect.left <= windowWidth * (1 - threshold)) && ((rect.left + rect.width) >= windowWidth * threshold);
        
        return vertInView && horInView;
    },

    // Enhanced number animation with easing
    animateNumber: (element, start, end, duration, suffix = '') => {
        const startTime = performance.now();
        const easeOutQuart = t => 1 - (--t) * t * t * t;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutQuart(progress);
            const current = Math.floor(start + (end - start) * easedProgress);
            
            element.textContent = current + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    },

    // Generate random number in range
    randomInRange: (min, max) => {
        return Math.random() * (max - min) + min;
    },

    // Format date for blog posts
    formatDate: (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(currentLanguage === 'ar' ? 'ar-EG' : 'en-US', options);
    },

    // Validate email format
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Create notification
    showNotification: (message, type = 'success', duration = 3000) => {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 9999;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, duration);
    }
};

// ===== Enhanced Loading Screen =====
const loadingScreen = {
    init: () => {
        // Enhanced loading with progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += utils.randomInRange(5, 15);
            if (progress >= 100) {
                progress = 100;
                clearInterval(progressInterval);
                loadingScreen.hide();
            }
        }, 100);

        // Fallback: hide after maximum time
        setTimeout(() => {
            clearInterval(progressInterval);
            loadingScreen.hide();
        }, 3000);
    },

    hide: () => {
        if (elements.loadingScreen) {
            elements.loadingScreen.classList.add('hidden');
            setTimeout(() => {
                elements.loadingScreen.style.display = 'none';
                // Initialize AOS after loading screen is hidden
                if (typeof AOS !== 'undefined') {
                    AOS.init({
                        duration: 800,
                        easing: 'ease-out-cubic',
                        once: true,
                        offset: 100
                    });
                }
            }, 500);
        }
    }
};

// ===== Enhanced Navigation =====
const navigation = {
    init: () => {
        navigation.setupScrollEffect();
        navigation.setupMobileMenu();
        navigation.setupSmoothScrolling();
        navigation.setupActiveLinks();
        navigation.setupKeyboardNavigation();
    },

    setupScrollEffect: () => {
        let lastScrollY = window.scrollY;
        
        const handleScroll = utils.throttle(() => {
            const currentScrollY = window.scrollY;
            
            // Add/remove scrolled class
            if (currentScrollY > 50) {
                elements.navbar.classList.add('scrolled');
            } else {
                elements.navbar.classList.remove('scrolled');
            }
            
            // Hide/show navbar on scroll
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                elements.navbar.style.transform = 'translateY(-100%)';
            } else {
                elements.navbar.style.transform = 'translateY(0)';
            }
            
            lastScrollY = currentScrollY;
        }, 10);

        window.addEventListener('scroll', handleScroll);
    },

    setupMobileMenu: () => {
        if (elements.hamburger && elements.navMenu) {
            elements.hamburger.addEventListener('click', () => {
                const isActive = elements.hamburger.classList.contains('active');
                
                elements.hamburger.classList.toggle('active');
                elements.navMenu.classList.toggle('active');
                
                // Prevent body scroll when menu is open
                document.body.style.overflow = isActive ? 'auto' : 'hidden';
            });

            // Close mobile menu when clicking on a link
            elements.navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    elements.hamburger.classList.remove('active');
                    elements.navMenu.classList.remove('active');
                    document.body.style.overflow = 'auto';
                });
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!elements.navbar.contains(e.target) && elements.navMenu.classList.contains('active')) {
                    elements.hamburger.classList.remove('active');
                    elements.navMenu.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
            });

            // Close mobile menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && elements.navMenu.classList.contains('active')) {
                    elements.hamburger.classList.remove('active');
                    elements.navMenu.classList.remove('active');
                    document.body.style.overflow = 'auto';
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
                
                // Add ripple effect
                navigation.createRipple(e, link);
            });
        });
    },

    setupActiveLinks: () => {
        const sections = document.querySelectorAll('section[id]');
        
        const handleScroll = utils.throttle(() => {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 150;
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
    },

    setupKeyboardNavigation: () => {
        // Tab navigation enhancement
        elements.navLinks.forEach(link => {
            link.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    link.click();
                }
            });
        });
    },

    createRipple: (event, element) => {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
};

// ===== Enhanced Language Toggle =====
const languageToggle = {
    init: () => {
        const savedLanguage = localStorage.getItem('portfolio-language') || 'ar';
        languageToggle.setLanguage(savedLanguage);

        if (elements.langToggle) {
            elements.langToggle.addEventListener('click', languageToggle.toggle);
        }
    },

    toggle: () => {
        const newLanguage = currentLanguage === 'ar' ? 'en' : 'ar';
        languageToggle.setLanguage(newLanguage);
        
        // Add transition effect
        document.body.style.transition = 'opacity 0.3s ease';
        document.body.style.opacity = '0.8';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
            setTimeout(() => {
                document.body.style.transition = '';
            }, 300);
        }, 150);
    },

    setLanguage: (language) => {
        currentLanguage = language;
        
        document.documentElement.lang = language;
        document.documentElement.dir = translations[language].direction;
        
        document.body.className = document.body.className.replace(/lang-\w+/, '');
        document.body.classList.add(`lang-${language}`);
        
        if (elements.langText) {
            elements.langText.textContent = language === 'ar' ? 'EN' : 'ع';
        }
        
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
        
        localStorage.setItem('portfolio-language', language);
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language } }));
    }
};

// ===== Enhanced Theme Toggle =====
const themeToggle = {
    init: () => {
        const savedTheme = localStorage.getItem('portfolio-theme') || 
                          (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        themeToggle.setTheme(savedTheme);

        if (elements.themeToggle) {
            elements.themeToggle.addEventListener('click', themeToggle.toggle);
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('portfolio-theme')) {
                themeToggle.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    },

    toggle: () => {
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        themeToggle.setTheme(newTheme);
        
        // Add smooth transition
        document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            document.documentElement.style.transition = '';
        }, 300);
    },

    setTheme: (theme) => {
        currentTheme = theme;
        
        document.documentElement.setAttribute('data-theme', theme);
        
        if (elements.themeToggle) {
            const icon = elements.themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            }
        }
        
        localStorage.setItem('portfolio-theme', theme);
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }
};

// ===== Enhanced Skills Animation =====
const skillsAnimation = {
    init: () => {
        skillsAnimation.setupIntersectionObserver();
    },

    setupIntersectionObserver: () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    skillsAnimation.animateSkillBars(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        const skillsSection = document.getElementById('skills');
        if (skillsSection) {
            observer.observe(skillsSection);
        }
    },

    animateSkillBars: (section) => {
        const skillBars = section.querySelectorAll('.skill-progress');
        
        skillBars.forEach((bar, index) => {
            setTimeout(() => {
                const width = bar.getAttribute('data-width');
                bar.style.width = width + '%';
                
                // Add counter animation
                const skillItem = bar.closest('.skill-item');
                const percentage = skillItem.querySelector('.skill-percentage');
                if (percentage) {
                    utils.animateNumber(percentage, 0, parseInt(width), 1500, '%');
                }
            }, index * 200);
        });
    }
};

// ===== Enhanced Statistics Animation =====
const statisticsAnimation = {
    init: () => {
        statisticsAnimation.setupIntersectionObserver();
    },

    setupIntersectionObserver: () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    statisticsAnimation.animateNumbers(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        elements.statNumbers.forEach(stat => {
            observer.observe(stat);
        });
    },

    animateNumbers: (element) => {
        const text = element.textContent;
        const number = parseInt(text.replace(/\D/g, ''));
        const suffix = text.replace(/\d/g, '');
        
        utils.animateNumber(element, 0, number, 2000, suffix);
    }
};

// ===== Enhanced Contact Form =====
const contactForm = {
    init: () => {
        if (elements.contactForm) {
            contactForm.setupFormValidation();
            contactForm.setupFormSubmission();
            contactForm.setupFloatingLabels();
        }
    },

    setupFormValidation: () => {
        const inputs = elements.contactForm.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => contactForm.validateField(input));
            input.addEventListener('input', () => contactForm.clearErrors(input));
        });
    },

    validateField: (field) => {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Remove existing error
        contactForm.clearErrors(field);

        // Validation rules
        switch (field.type) {
            case 'email':
                if (!value) {
                    errorMessage = currentLanguage === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required';
                    isValid = false;
                } else if (!utils.isValidEmail(value)) {
                    errorMessage = currentLanguage === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email format';
                    isValid = false;
                }
                break;
            case 'text':
                if (!value) {
                    errorMessage = currentLanguage === 'ar' ? 'هذا الحقل مطلوب' : 'This field is required';
                    isValid = false;
                } else if (value.length < 2) {
                    errorMessage = currentLanguage === 'ar' ? 'يجب أن يكون أكثر من حرفين' : 'Must be at least 2 characters';
                    isValid = false;
                }
                break;
            default:
                if (!value) {
                    errorMessage = currentLanguage === 'ar' ? 'هذا الحقل مطلوب' : 'This field is required';
                    isValid = false;
                }
        }

        if (!isValid) {
            contactForm.showError(field, errorMessage);
        }

        return isValid;
    },

    showError: (field, message) => {
        field.classList.add('error');
        
        let errorElement = field.parentNode.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'error-message';
            errorElement.style.cssText = `
                color: #ef4444;
                font-size: 0.875rem;
                margin-top: 0.25rem;
                display: block;
            `;
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
    },

    clearErrors: (field) => {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    },

    setupFormSubmission: () => {
        elements.contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(elements.contactForm);
            const inputs = elements.contactForm.querySelectorAll('input, textarea');
            let isFormValid = true;

            // Validate all fields
            inputs.forEach(input => {
                if (!contactForm.validateField(input)) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                contactForm.submitForm(formData);
            } else {
                utils.showNotification(
                    currentLanguage === 'ar' ? 'يرجى تصحيح الأخطاء في النموذج' : 'Please correct the errors in the form',
                    'error'
                );
            }
        });
    },

    submitForm: async (formData) => {
        const submitButton = elements.contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        // Show loading state
        submitButton.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <span>${currentLanguage === 'ar' ? 'جاري الإرسال...' : 'Sending...'}</span>
        `;
        submitButton.disabled = true;

        try {
            // Simulate form submission (replace with actual endpoint)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Success
            utils.showNotification(
                currentLanguage === 'ar' ? 'تم إرسال رسالتك بنجاح!' : 'Your message has been sent successfully!',
                'success'
            );
            
            elements.contactForm.reset();
            
        } catch (error) {
            // Error
            utils.showNotification(
                currentLanguage === 'ar' ? 'حدث خطأ في إرسال الرسالة' : 'An error occurred while sending the message',
                'error'
            );
        } finally {
            // Reset button
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    },

    setupFloatingLabels: () => {
        const formGroups = elements.contactForm.querySelectorAll('.form-group');
        
        formGroups.forEach(group => {
            const input = group.querySelector('input, textarea');
            const label = group.querySelector('label');
            
            if (input && label) {
                // Check initial state
                if (input.value) {
                    label.classList.add('active');
                }
                
                input.addEventListener('focus', () => {
                    label.classList.add('active');
                });
                
                input.addEventListener('blur', () => {
                    if (!input.value) {
                        label.classList.remove('active');
                    }
                });
            }
        });
    }
};

// ===== Enhanced Back to Top Button =====
const backToTop = {
    init: () => {
        if (elements.backToTop) {
            backToTop.setupScrollListener();
            backToTop.setupClickHandler();
        }
    },

    setupScrollListener: () => {
        const handleScroll = utils.throttle(() => {
            if (window.scrollY > 300) {
                elements.backToTop.classList.add('visible');
            } else {
                elements.backToTop.classList.remove('visible');
            }
        }, 100);

        window.addEventListener('scroll', handleScroll);
    },

    setupClickHandler: () => {
        elements.backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
};

// ===== Enhanced Parallax Effects =====
const parallaxEffects = {
    init: () => {
        parallaxEffects.setupFloatingElements();
        parallaxEffects.setupScrollParallax();
    },

    setupFloatingElements: () => {
        const floatingElements = document.querySelectorAll('.floating-element');
        
        floatingElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.2);
            const amplitude = 20 + (index * 10);
            
            const animate = () => {
                const time = Date.now() * 0.001;
                const y = Math.sin(time * speed) * amplitude;
                const x = Math.cos(time * speed * 0.5) * (amplitude * 0.5);
                
                element.style.transform = `translate(${x}px, ${y}px)`;
                requestAnimationFrame(animate);
            };
            
            animate();
        });
    },

    setupScrollParallax: () => {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        const handleScroll = utils.throttle(() => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const rate = scrolled * -0.5;
                element.style.transform = `translateY(${rate}px)`;
            });
        }, 10);

        window.addEventListener('scroll', handleScroll);
    }
};

// ===== Enhanced Intersection Observer =====
const intersectionObserver = {
    init: () => {
        intersectionObserver.setupAnimationObserver();
        intersectionObserver.setupLazyLoading();
    },

    setupAnimationObserver: () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Trigger specific animations based on element type
                    if (entry.target.classList.contains('project-card')) {
                        intersectionObserver.animateProjectCard(entry.target);
                    } else if (entry.target.classList.contains('testimonial-card')) {
                        intersectionObserver.animateTestimonialCard(entry.target);
                    }
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        // Observe all animatable elements
        const animatableElements = document.querySelectorAll('.project-card, .testimonial-card, .blog-card, .interest-category');
        animatableElements.forEach(element => {
            observer.observe(element);
        });
    },

    setupLazyLoading: () => {
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

        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    },

    animateProjectCard: (card) => {
        const image = card.querySelector('.project-image img');
        const content = card.querySelector('.project-content');
        
        if (image) {
            setTimeout(() => {
                image.style.transform = 'scale(1.05)';
            }, 200);
        }
        
        if (content) {
            const techTags = content.querySelectorAll('.tech-tag');
            techTags.forEach((tag, index) => {
                setTimeout(() => {
                    tag.style.transform = 'translateY(0)';
                    tag.style.opacity = '1';
                }, 300 + (index * 100));
            });
        }
    },

    animateTestimonialCard: (card) => {
        const quote = card.querySelector('.testimonial-quote');
        const text = card.querySelector('.testimonial-text');
        
        if (quote) {
            setTimeout(() => {
                quote.style.transform = 'scale(1.1) rotate(360deg)';
            }, 200);
        }
        
        if (text) {
            setTimeout(() => {
                text.style.opacity = '1';
                text.style.transform = 'translateY(0)';
            }, 400);
        }
    }
};

// ===== Enhanced Performance Monitoring =====
const performanceMonitor = {
    init: () => {
        performanceMonitor.measurePageLoad();
        performanceMonitor.setupFPSMonitor();
    },

    measurePageLoad: () => {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
            
            console.log(`Page load time: ${loadTime}ms`);
            
            // Send analytics if needed
            if (loadTime > 3000) {
                console.warn('Page load time is slow');
            }
        });
    },

    setupFPSMonitor: () => {
        let lastTime = performance.now();
        let frameCount = 0;
        
        const measureFPS = (currentTime) => {
            frameCount++;
            
            if (currentTime >= lastTime + 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                
                if (fps < 30) {
                    console.warn(`Low FPS detected: ${fps}`);
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        requestAnimationFrame(measureFPS);
    }
};

// ===== Enhanced Error Handling =====
const errorHandler = {
    init: () => {
        window.addEventListener('error', errorHandler.handleError);
        window.addEventListener('unhandledrejection', errorHandler.handlePromiseRejection);
    },

    handleError: (event) => {
        console.error('JavaScript Error:', event.error);
        
        // Show user-friendly message for critical errors
        if (event.error.name === 'TypeError' || event.error.name === 'ReferenceError') {
            utils.showNotification(
                currentLanguage === 'ar' ? 'حدث خطأ تقني، يرجى إعادة تحميل الصفحة' : 'A technical error occurred, please reload the page',
                'error',
                5000
            );
        }
    },

    handlePromiseRejection: (event) => {
        console.error('Unhandled Promise Rejection:', event.reason);
        event.preventDefault();
    }
};

// ===== Enhanced Keyboard Shortcuts =====
const keyboardShortcuts = {
    init: () => {
        document.addEventListener('keydown', keyboardShortcuts.handleKeydown);
    },

    handleKeydown: (event) => {
        // Ctrl/Cmd + K: Focus search (if implemented)
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            // Focus search input if available
        }
        
        // Escape: Close mobile menu
        if (event.key === 'Escape') {
            if (elements.navMenu.classList.contains('active')) {
                elements.hamburger.classList.remove('active');
                elements.navMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        }
        
        // Home: Scroll to top
        if (event.key === 'Home' && !event.target.matches('input, textarea')) {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        // End: Scroll to bottom
        if (event.key === 'End' && !event.target.matches('input, textarea')) {
            event.preventDefault();
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
    }
};

// ===== Main Initialization =====
const app = {
    init: () => {
        // Initialize all modules
        loadingScreen.init();
        navigation.init();
        languageToggle.init();
        themeToggle.init();
        skillsAnimation.init();
        statisticsAnimation.init();
        contactForm.init();
        backToTop.init();
        parallaxEffects.init();
        intersectionObserver.init();
        performanceMonitor.init();
        errorHandler.init();
        keyboardShortcuts.init();
        
        // Custom event listeners
        document.addEventListener('languageChanged', app.handleLanguageChange);
        document.addEventListener('themeChanged', app.handleThemeChange);
        
        console.log('Portfolio website initialized successfully');
    },

    handleLanguageChange: (event) => {
        console.log(`Language changed to: ${event.detail.language}`);
        // Reinitialize components that depend on language
    },

    handleThemeChange: (event) => {
        console.log(`Theme changed to: ${event.detail.theme}`);
        // Update theme-dependent components
    }
};

// ===== Initialize when DOM is ready =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
} else {
    app.init();
}

// ===== Add CSS animations for enhanced effects =====
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .animate-in {
        animation: slideInUp 0.6s ease-out forwards;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .tech-tag {
        transform: translateY(20px);
        opacity: 0;
        transition: all 0.3s ease;
    }
    
    .testimonial-text {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.5s ease;
    }
    
    .error {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    }
    
    .form-group label.active {
        top: -0.5rem;
        font-size: 0.875rem;
        color: var(--primary-color);
    }
`;

document.head.appendChild(style);

