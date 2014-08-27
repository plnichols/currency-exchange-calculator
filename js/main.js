var App = (function() {

    var body = $("body"),
        elems = $("[data-mobile-toggle]"),
        allClasses = "";

    function stickyTopNav() {
        var header = $(".header-container"),
            nav = $(".secondary-nav-container"),
            headerHeight = 0,
            navHeight = 0;

        $(window).scroll(function () { 
            headerHeight = header.outerHeight();
            navHeight = nav.outerHeight()
            
            if ($(this).scrollTop() > headerHeight) {
                body.addClass("sticky");
                // header.css("margin-bottom",navHeight);
            } else {
                body.removeClass("sticky");
                header.removeAttr("style");
            }
        });
    }

    function toggleEvents() {
        for(var i=0; i<elems.length; i++) {
            $(elems[i]).on("click", function(){
                toggleMobile($(this).data("mobile-toggle"));
            });
            allClasses += $(elems[i]).data("mobile-toggle") + " ";
        };
    }

    function toggleMobile(thisclass) {
        if(body.hasClass(thisclass)) {
            body.removeClass(allClasses);
        }else{
            body.removeClass(allClasses).addClass(thisclass);
        }
    }

    function submitLoginForm() {
        $("#login-form").on("submit", function(e){
            e.preventDefault();
            var username = $(this).find("#username").val(),
                password = $(this).find("#password").val();
                
            if(username && password){
                $(this).hide();
                $(".login-connected").show().find(".login-connected-name").text(username);
                $(".list-mobile .login").text("Account");
            }else{
                alert("Please enter a username and password.")
            }
        })
    }

    return {
        init : function() {
            stickyTopNav();
            toggleEvents();
            submitLoginForm();
        }
    };
})();

App.init();