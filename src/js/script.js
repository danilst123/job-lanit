$(function() {
  function setSizes() {
    setTimeout(function() {
      // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
      var vh = window.innerHeight * 0.01;
      // Then we set the value in the --vh custom property to the root of the document
      document.documentElement.style.setProperty("--vh", vh + "px");
    }, 50);

    if ($(window).width() < 1248) {
      $(".header__togglable").css({
        width: $(window).width() + "px"
      });
      $(".header, .modal").css({
        width: "100%"
      });
    } else {
      $(".header__togglable").css({
        width: "auto"
      });
      $(".header, .modal").css({
        width: $(window).width() + "px"
      });
    }
    $("html, body").css({
      width: $(window).width() + "px"
    });
  }

  setSizes();

  $(window).resize(function() {
    setSizes();
  });

  $(".hamburger").click(function() {
    $(this).toggleClass("hamburger--active");
    $(".header__togglable").fadeToggle("200");
    $("body, html").toggleClass("noscroll");
  });

  // Плавная анимация
  $(".landingMenu").liLanding();

  $(".nav__item").click(function(e) {
    e.preventDefault();

    var target = $(this).attr("href"),
      dest = $(target).find(".section-title").length
        ? $(target)
            .find(".section-title")
            .offset().top
        : $(target).offset().top,
      offset = $(target).find(".section-title").length
        ? $(".header").outerHeight() + 10
        : $(".header").outerHeight();

    $(".hamburger").removeClass("hamburger--active");

    if ($(window).width() < 1265) {
      $(".header__togglable").fadeOut("200");
    }

    $("html, body")
      .stop(true)
      .animate(
        {
          scrollTop: dest - offset
        },
        1000
      );

    $("body, html").removeClass("noscroll");
  });

  // Custom selects
  $(".select").each(function() {
    var selectWrapper = $(this),
      select = selectWrapper.find("select"),
      isMultiple = selectWrapper.hasClass("select--multiple") ? true : false,
      isNumeric = selectWrapper.hasClass("select--numeric") ? true : false,
      isLimited = selectWrapper.hasClass("select--limited") ? true : false,
      isInModal = selectWrapper.parents(".modal").length ? true : false,
      hiddenEls,
      choiceBoxDOM,
      choiceBoxDOMWidth,
      choicesArray,
      choicesArrayDOM,
      choicesArrayDOMWidth,
      totalOptionsArray = select[0].options,
      totalOptionsCount = totalOptionsArray.length,
      selectedOptionsCount = select.val().length;

    select
      .css({ width: "100%" })
      .select2({
        allowClear: false,
        minimumResultsForSearch: -1,
        shouldFocusInput: -1,
        closeOnSelect: true,
        language: {
          noResults: function() {
            return "Результаты не найдены";
          }
        }
      })
      .on("select2:open", function(e) {
        dropdown = $(".select2-dropdown");
        setModalClasses();
      })
      .on("select2:select", function(e) {
        /* var elm = (activeEl = e.params.data.element);
        $elm = jQuery(elm);
        $t = jQuery(this);
        $t.append($elm);
        $t.trigger("change") */
      })
      .on("select2:unselecting", function(e) {})
      .on("change", function(e) {
        if (isMultiple) {
          if (isLimited) {
            handleLimit();
          }
          handleResetBtn();
          handleSelectedItem();
        }
      });

    function setModalClasses() {
      if (isInModal) {
        if (selectWrapper.parents(".modal").hasClass("modal--3")) {
          dropdown
            .closest(".select2-container")
            .addClass("select2-container--in-modal-3");
        } else if (selectWrapper.parents(".modal").hasClass("modal--2")) {
          dropdown
            .closest(".select2-container")
            .addClass("select2-container--in-modal-2");
        } else {
          dropdown
            .closest(".select2-container")
            .addClass("select2-container--in-modal");
        }
      }
    }

    function setSelectedOptions() {
      selectedOptionsCount = select.val().length;
    }

    function setChoice() {
      choiceBoxDOM = selectWrapper.find("ul.select2-selection__rendered");
      choicesArrayDOM = choiceBoxDOM[0].children;
      choicesArray = [];

      for (var i = 0; i < choicesArrayDOM.length; i++) {
        if ($(choicesArrayDOM[i]).hasClass("select2-selection__choice")) {
          choicesArray.push(choicesArrayDOM[i]);
        }
      }
    }

    function setChoicesWidth() {
      choiceBoxDOMWidth = 0;
      choicesArrayDOMWidth = 0;
      for (var i = 0; i < choicesArray.length; i++) {
        choicesArrayDOMWidth += choicesArray[i].clientWidth;
      }
      choiceBoxDOMWidth = choiceBoxDOM[0].clientWidth - 60;
    }

    function setHiddenEls() {
      hiddenEls = [];
      for (var i = 0; i < choicesArray.length; i++) {
        if ($(choicesArray[i]).css("display") == "none") {
          hiddenEls.push(choicesArray[i]);
        }
      }
    }

    function buildHiddenElsCount(hiddenElsCount) {
      $(".select2-selection__count").remove();
      choiceBoxDOM.append(
        '<li class="select2-selection__count">+' + hiddenElsCount + "</li>"
      );
    }

    function resetLimit() {
      hiddenEls = [];
      $(".select2-selection__count").remove();
      $(choicesArray).show();
      setChoice();
      setChoicesWidth();
    }

    function handleLimit() {
      resetLimit();

      var i = choicesArray.length - 1;
      while (choicesArrayDOMWidth > choiceBoxDOMWidth) {
        $(choicesArray[i]).hide();
        setChoicesWidth();
        setHiddenEls();
        buildHiddenElsCount(hiddenEls.length);
        i--;
      }
    }

    function handleResetBtn() {
      setSelectedOptions();

      selectWrapper.find(".select__reset").css({
        visibility: selectedOptionsCount ? "visible" : "hidden"
      });
    }

    function handleSelectedItem() {
      setSelectedOptions();
      setChoice();

      if (isNumeric && selectedOptionsCount != 0) {
        choicesArrayDOM.hide();
        choiceBoxDOM.prepend(
          '<li class="select2-selection__numeric">' +
            "Выбрано " +
            selectedOptionsCount +
            "</li>"
        );
      }

      if (selectedOptionsCount == totalOptionsCount) {
        choiceBoxDOM.find(".select2-selection__numeric").hide();
        $(choicesArrayDOM).hide();

        choiceBoxDOM.prepend(
          '<li class="select2-selection__all-choice">' +
            '<span class="select2-selection__choice__remove" role="presentation">×</span>' +
            "Все" +
            "</li>"
        );

        choiceBoxDOM
          .find(
            ".select2-selection__all-choice .select2-selection__choice__remove"
          )
          .click(function(e) {
            e.preventDefault();

            select.val(null).trigger("change");
          });
      }
    }

    if (isMultiple) {
      if (isLimited) {
        handleLimit();
      }
      handleResetBtn();
      handleSelectedItem();

      $(window).resize(function() {
        if (isLimited) {
          handleLimit();
        }
        handleResetBtn();
        handleSelectedItem();
      });
    }
  });

  // Слайдер Карьера в ЛАНИТ
  $(".jobs__slider").slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    infinite: true,
    rows: 0,
    responsive: [
      {
        breakpoint: 1265,
        settings: {
          slidesToShow: 2
        }
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 1,
          adaptiveHeight: true
        }
      }
    ]
  });

  // Слайдер Секреты успеха ЛАНИТ
  $(".secrets__slider").slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    infinite: true,
    slide: ".secrets__slide",
    rows: 0,
    dots: true
  });

  // Custom file input
  $(".fileinput__input").change(function() {
    var input = $(this),
      wrapper = input.closest(".fileinput"),
      btn = wrapper.find(".fileinput__btn"),
      fileBlock = wrapper.find(".fileinput__files"),
      errorBlock = wrapper.find(".fileinput__error"),
      removeBtn = wrapper.find(".fileinput__remove"),
      files = input[0].files[0];

    if (
      false /*files.type !== 'text/xml' && !files.name.includes(".req") && !files.name.includes(".p10")*/
    ) {
      btn.addClass("btn--red");
      errorBlock.text("Формат выбранного файла не поддерживается").show();
      fileBlock.text("").hide();
      removeBtn.hide();
    } else {
      btn.removeClass("btn--red");
      fileBlock.text(files.name).show();
      errorBlock.text("").hide();
      removeBtn.show();
    }
  });

  // Remove inputed file
  $(".fileinput__remove").click(function() {
    var removeBtn = $(this),
      wrapper = removeBtn.closest(".fileinput"),
      input = wrapper.find(".fileinput__input"),
      fileBlock = wrapper.find(".fileinput__files");

    input.val("");
    fileBlock.text("").hide();
    removeBtn.hide();
  });

  // modal tabs
  $(".tabs-nav .tabs-nav__link").click(function(e) {
    e.preventDefault();

    $(this)
      .addClass("tabs-nav__link--active")
      .siblings(".tabs-nav__link")
      .removeClass("tabs-nav__link--active");
    $(".tabs__tab" + $(this).attr("href"))
      .slideDown("100")
      .siblings(".tabs__tab")
      .slideUp();
  });

  // slide toggle
  $(".slide-toggle__head").click(function(e) {
    $(this)
      .toggleClass("slide-toggle__head--active")
      .next()
      .slideToggle("300");
  });

  $('[name="phone"]').mask("+7 (999) 999-9999");

  //datepicker
  $(".input-date").datepicker({
    todayButton: new Date()
  });

  // Закрыть модальное окно
  $(".modal__close, .modal__bg").click(function() {
    $(this)
      .closest(".modal")
      .fadeOut(400);
    $("body, html").removeClass("noscroll");
  });

  // добавление новых полей
  $(".fieldset--add").each(function() {
    var addField = $(this),
      feildBox = addField.prev().clone();

    addField.click(function(e) {
      e.preventDefault();
      addField.before(feildBox);
    });
  });

  // подсказки поиска
  $(".search__field").focusin(function() {
    $(".suggestions").fadeIn("100");
  });
  $(".search__field").focusout(function() {
    $(".suggestions").fadeOut("100");
  });

  $(".operate-btn__btn").click(function(e) {
    e.preventDefault();
    $($(this).attr("href")).fadeToggle("100");
    $("body, html").addClass("noscroll");
  });

  var params = {
    // объект параметров плагина
  };

  // Инициализируем при загрузки DOM
  initScrollbar($(".modal__box"), params);

  // Инициализируем/разгрушаем по изменению окна браузера
  $(window).on("resize", function() {
    initScrollbar($(".modal__box"), params);
  });

  function initScrollbar($selector, options) {
    // Если ширина окна меньше чем 1025 px
    if ($(window).width() < 1025) {
      // Если на этом селекторе уже был инициализирован плагин, то разрушим его
      // Если нет, то ничего не делаем
      if ($selector.data("mCS")) $selector.mCustomScrollbar("destroy");
    } else {
      // Если ширина окна больше 992 px, То инициализируем плагин
      $selector.mCustomScrollbar(options || {});
    }
  }

  //$('.modal__box').mCustomScrollbar();

  // Чанки городов у Поиска вакансий
  $(".chunks").each(function(index, item) {
    var that = $(this),
      chunksArr = that.find(".chunks__item"),
      maxLenth = that.data("length");

    if (chunksArr.length > maxLenth) {
      var hiddenItemsArr = $(chunksArr.slice(maxLenth));

      hiddenItemsArr.hide();
      $(that)
        .append("<div class='chunks__more'>Больше</div>")
        .find(".chunks__more")
        .click(function() {
          hiddenItemsArr.fadeIn("100");
          $(this).remove();
        });
    }
  });

  // Переключатели Поиска вакансий
  $(".form-grid--vacancySearchSubmit").click(function(e) {
    var checkboxes = this.querySelectorAll("input[type='checkbox']"),
      radio = this.querySelector("input[type='radio']");

    if (e.target.type == "radio") {
      for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
      }
    }
    if (e.target.type == "checkbox") {
      radio.checked = false;
    }
  });

  // Wow.js
  new WOW().init();

  $(".progress-list").each(function() {
    $(this)
      .find("li")
      .prepend("<span class='progress-list__bullit'></span>  ");
  });

  $(".internship-path__superman").each(function(index, element) {
    function checkSuperman() {
      var scrl = $(document).scrollTop();

      if (scrl > 0) {
        element.style.animationPlayState = "paused";
        //element.style.animationName = "none";
      } else {
        element.style.animationPlayState = "";
        //element.style.animationName = "superman";
      }
      scrl = scrl / 1.1;

      element.style.transform = "translateY(-" + Math.round(scrl) + "px)";
    }
    checkSuperman();

    $(document).scroll(function() {
      checkSuperman();
    });
  });
});
