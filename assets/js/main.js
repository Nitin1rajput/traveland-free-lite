$(function () {
  "use strict";
    async function logAppOpenedWithLocation() {
    try {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();

      // Log event with IP location
      amplitude.getInstance().logEvent("App_Opened", {
        timestamp: new Date().toISOString(),
        path: window.location.pathname,
        referrer: document.referrer || "direct",
        userAgent: navigator.userAgent,
        location: {
          ip: data.ip,
          city: data.city,
          region: data.region,
          country: data.country_name,
          latitude: data.latitude,
          longitude: data.longitude,
        },
      });
    } catch (err) {
      console.warn("IP location fetch failed", err);

      // Fallback log without location
      amplitude.getInstance().logEvent("App_Opened", {
        timestamp: new Date().toISOString(),
        path: window.location.pathname,
        referrer: document.referrer || "direct",
        userAgent: navigator.userAgent,
        location: "ip_lookup_failed",
      });
    }
  }

  // Call when app starts
  logAppOpenedWithLocation();

  // ========= Preloader =========
  $(window).on('load', function () {
    $('.preloader').delay(500).fadeOut(500);
  });

  // ========= Sticky Navbar =========
  const $navbar = $(".header_navbar");
  const $navbarLogo = $(".header_navbar img");

  $(window).on('scroll', function () {
    const scrollTop = $(this).scrollTop();
    if (scrollTop < 20) {
      $navbar.removeClass("sticky");
      $navbarLogo.attr("src", "assets/images/logo.svg");
    } else {
      $navbar.addClass("sticky");
      $navbarLogo.attr("src", "assets/images/logo-2.svg");
    }
  });

  // ========= Section Menu Active =========
  const scrollLink = $('.page-scroll');

  $(window).on('scroll', function () {
    const scrollPos = $(this).scrollTop();

    scrollLink.each(function () {
      const section = $(this.hash);
      if (!section.length) return;

      const sectionOffset = section.offset().top - 73;

      if (scrollPos >= sectionOffset) {
        $(this).parent().addClass('active').siblings().removeClass('active');
      }
    });
  });

  // ========= Navbar Collapse =========
  $(".navbar-nav a").on('click', function () {
    $(".navbar-collapse").removeClass("show");
    $(".navbar-toggler").removeClass("active");
  });

  $(".navbar-toggler").on('click', function () {
    $(this).toggleClass("active");
  });

  // ========= Counter Up =========
  if ($('.counter').length > 0) {
    $('.counter').counterUp({
      delay: 10,
      time: 3000
    });
  }

  // ========= Back to Top Button =========
  const $backToTop = $('.back-to-top');

  $(window).on('scroll', function () {
    if ($(this).scrollTop() > 600) {
      $backToTop.fadeIn(200);
    } else {
      $backToTop.fadeOut(200);
    }
  });

  $backToTop.on('click', function (e) {
    e.preventDefault();
    $('html, body').animate({ scrollTop: 0 }, 1500);
  });

  // ========= Nice Select =========
  if ($.fn.niceSelect) {
    $('select').niceSelect();
  }

  // ========= WOW Animation =========
  if (typeof WOW === "function") {
    new WOW({
      boxClass: 'wow',
      mobile: false
    }).init();
  }

  // ========= Location Detection =========
  function setUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        $('#latitude').val(lat);
        $('#longitude').val(lng);
        $('#location_method').val('gps');

        amplitude.getInstance().logEvent("Location_Detected", {
          method: "gps",
          latitude: lat,
          longitude: lng
        });
      },
      async () => {
        try {
          const res = await fetch("https://ipapi.co/json/");
          const data = await res.json();

          $('#latitude').val(data.latitude);
          $('#longitude').val(data.longitude);
          $('#location_method').val('ip');

          amplitude.getInstance().logEvent("Location_Detected", {
            method: "ip",
            city: data.city,
            region: data.region,
            country: data.country_name,
            latitude: data.latitude,
            longitude: data.longitude
          });
        } catch (err) {
          console.warn("Location fetch failed");
        }
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }
}


  setUserLocation(); // ✅ Run when document ready
});
