(function() {
  'use strict';

  // ---------------------------
  // Common: Main Preloader
  // ---------------------------
  if ($('.preloader').length) {
    preloader.init();
  }

  // ---------------------------
  // Common: Modal
  // ---------------------------
  if ($('.modal').length) {
    modal.init();
  }

  // ---------------------------
  // Common: Burger Menu
  // ---------------------------
  if ($('#burger-btn').length) {
    hamburgerMenu.init();
  }

  // ---------------------------
  // Common: Scroll Up, Scroll Down Animation
  // ---------------------------
  if ($('.scroll-control--down').length || $('.scroll-control--up').length) {
    scrollButtons.init();
  }

  // ---------------------------
  // Home Page: Parallax
  // ---------------------------
  if ($('.parallax').length) {
    parallax.init();
  }

  // ---------------------------
  // Home Page: Login Form Sending
  // ---------------------------
  if ($('.form--login').length) {
    loginForm.init();
  }

  // ---------------------------
  // Home Page: Flip Animation
  // ---------------------------
  if ($('.flip-container').length) {
    flipCard.init();
  }

  // ---------------------------
  // Blog Page: Menu and ScrollSpy
  // ---------------------------

  // if there is a preloader on page
  if ($('.preloader').length) {

    // wait until preloader is loaded
    preloader.contentReady.done(function() {
      if ($('.off-canvas--menu').length) {
        blogMenuPanel.init();
      }
      if ($('.blog-nav__link').length) {
        scrollspy.init();
      }
    });

  } else {
    if ($('.off-canvas--menu').length) {
      blogMenuPanel.init();
    }
    if ($('.blog-nav__link').length) {
      scrollspy.init();
    }
  }



  // ---------------------------
  // Works Page: Blur
  // ---------------------------
  if ($('.blur').length) {
    blur.init();
  }

  // ---------------------------
  // Works Page: Slider
  // ---------------------------
  if ($('.slider').length) {
    slider.init();
  }

  // ---------------------------
  // Works Page: Slider Titles Animation
  // ---------------------------
  if ($('.slider__info').length) {
    sliderTitlesAnimation.init();
  }

  // ---------------------------
  // Works Page: Sending Contact Form
  // ---------------------------
  if ($('.form--contact').length) {
    contactForm.init();
  }


  // ---------------------------
  // About Page: Skills Animation
  // ---------------------------
  if ($('.skills__item').length) {
    skillsAnimation.init();
  }

  // ---------------------------
  // Admin Page: Adding Blog Post Init
  // ---------------------------
  if ($('#add-blog-btn').length) {
    addBlogForm.init('#add-blog-btn');
  }


  // ---------------------------
  // Admin Page: Edit Skills Init
  // ---------------------------
  if ($('#edit-skills-btn').length) {
    esitSkillsForm.init('#edit-skills-btn');
  }


  // ---------------------------
  // Admin Page: Admin Menu Tabs
  // ---------------------------
  if ($('.admin__menu-item').length && $('.admin__tabs').length ) {
    adminTabs.init('.admin__menu-item', '.admin__tabs');
  }


})();