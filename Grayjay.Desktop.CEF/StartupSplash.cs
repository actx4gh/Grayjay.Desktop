using System;
using System.Text;

namespace Grayjay.Desktop
{
    internal static class StartupSplash
    {
        private const int ThemeSystem = 0;
        private const int ThemeDark = 1;
        private const int ThemeLight = 2;

        private const string DarkBackground = "#141414";
        private const string LightBackground = "#f5f5f3";
        private const string DarkText = "#ffffff";
        private const string LightText = "#141414";
        private const string DarkLoaderGlow = "rgba(1, 155, 231, 0.35)";
        private const string LightLoaderGlow = "rgba(20, 20, 20, 0.10)";
        private const string Accent = "#019be7";
        private const string AccentGradientStop = "#01D6E6";

        public static string CreateDataUrl(int theme)
        {
            var html = CreateHtml(theme);
            return "data:text/html;base64," + Convert.ToBase64String(Encoding.UTF8.GetBytes(html));
        }


        public static string CreateThemedWebUrl(string baseUrl, string indexUrl, int theme)
        {
            return AppendStartupThemeQuery(baseUrl + indexUrl, theme);
        }

        public static string AppendStartupThemeQuery(string url, int theme)
        {
            var fragmentStart = url.IndexOf('#');
            var mainUrl = fragmentStart >= 0 ? url[..fragmentStart] : url;
            var fragment = fragmentStart >= 0 ? url[fragmentStart..] : string.Empty;
            var separator = mainUrl.Contains('?') ? "&" : "?";

            return mainUrl + separator + "gjStartupTheme=" + GetStartupThemeSource(theme) + fragment;
        }

        private static string GetStartupThemeSource(int theme)
        {
            if (theme == ThemeLight)
                return "light";

            if (theme == ThemeSystem)
                return "system";

            return "dark";
        }

        private static string CreateHtml(int theme)
        {
            return "<!doctype html><html><head><meta charset=\"utf-8\"><style>" +
                "@import url(https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap);" +
                CreateThemeCss(theme) +
                "html,body{width:100%;height:100%;background:var(--gj-bg-root);color:var(--gj-text-primary);margin:0;font-family:Roboto,sans-serif;}" +
                ".loader-container{display:flex;justify-content:center;flex-direction:column;align-items:center;width:100%;height:100vh;}" +
                ".loader-svg{width:200px;height:200px;animation:gentle-pulse 3s ease-in-out infinite;filter:drop-shadow(0 0 28px var(--gj-loader-glow));}" +
                ".loading-text{color:var(--gj-text-primary);font-size:24px;margin-top:20px;font-weight:700;letter-spacing:1px;}" +
                ".loading-text span{opacity:0;animation:dot 1.5s infinite;}" +
                ".loading-text span:nth-child(1){animation-delay:0s;}" +
                ".loading-text span:nth-child(2){animation-delay:.5s;}" +
                ".loading-text span:nth-child(3){animation-delay:1s;}" +
                "@keyframes gentle-pulse{0%,100%{transform:scale(1);opacity:.8;}50%{transform:scale(1.1);opacity:1;}}" +
                "@keyframes dot{0%{opacity:0;}50%{opacity:1;}100%{opacity:0;}}" +
                "</style></head><body><div class=\"loader-container\">" +
                CreateLogoSvg() +
                "<p class=\"loading-text\">Loading<span>.</span><span>.</span><span>.</span></p>" +
                "</div></body></html>";
        }

        private static string CreateThemeCss(int theme)
        {
            if (theme == ThemeLight)
                return CreateRootCss("light", LightBackground, LightText, LightLoaderGlow);

            if (theme == ThemeSystem)
            {
                return CreateRootCss("dark", DarkBackground, DarkText, DarkLoaderGlow) +
                    "@media (prefers-color-scheme: light){" +
                    CreateRootCss("light", LightBackground, LightText, LightLoaderGlow) +
                    "}";
            }

            if (theme == ThemeDark)
                return CreateRootCss("dark", DarkBackground, DarkText, DarkLoaderGlow);

            return CreateRootCss("dark", DarkBackground, DarkText, DarkLoaderGlow);
        }

        private static string CreateRootCss(string colorScheme, string background, string text, string loaderGlow)
        {
            return ":root{" +
                "color-scheme:" + colorScheme + ";" +
                "--gj-bg-root:" + background + ";" +
                "--gj-text-primary:" + text + ";" +
                "--gj-loader-glow:" + loaderGlow + ";" +
                "--gj-accent:" + Accent + ";" +
                "--gj-accent-grad:linear-gradient(267deg," + AccentGradientStop + " -100.57%,var(--gj-accent) 90.96%);" +
                "}";
        }

        private static string CreateLogoSvg()
        {
            return "<svg class=\"loader-svg\" fill=\"none\" height=\"200\" viewBox=\"0 0 48 48\" width=\"200\" xmlns=\"http://www.w3.org/2000/svg\">" +
                "<path d=\"M23.8612 41.2516L46.2225 7.0022H1.5L23.8612 41.2516Z\" fill=\"url(#gj-splash-gradient)\" />" +
                "<path d=\"M6.8125 30.8715C7.72381 29.8994 9.98389 27.6758 11.7336 26.5579C13.4833 25.4401 15.5814 22.2444 16.4117 20.7863C18.9431 17.06 24.6135 9.27945 27.0437 7.96713C27.4811 7.62689 28.117 7.09632 28.3803 6.87358C29.2916 4.8484 32.3901 1.40566 37.4934 3.83586C37.9309 3.69003 39.0123 3.65358 39.4983 3.65358C39.1135 3.91686 38.3075 4.6864 38.1617 5.65848C37.7729 8.33164 36.2986 9.89103 35.61 10.3365C35.124 13.435 34.4557 16.169 32.9976 17.141L34.3342 19.5104C36.3391 21.6369 40.4947 26.2299 41.0777 27.5908C39.1338 26.9589 37.8782 26.3554 37.4934 26.1327L41.0777 31.0538C38.9718 30.8918 34.237 29.5228 32.1471 25.3429C32.9733 27.5786 33.7874 30.3652 34.0912 31.479C32.9571 30.5475 30.5188 27.8459 29.8384 24.4923C30.0328 27.7487 30.0004 30.0614 29.9599 30.8107C29.4131 30.3045 28.1494 28.7329 27.4689 26.4972V30.264C26.6529 29.1294 25.0112 26.375 24.8629 24.2966C24.9998 26.6524 24.9164 27.7567 24.8565 28.016L21.7581 25.0999C20.9277 25.5454 18.6961 26.5579 16.4117 27.044C14.8564 28.3563 12.9689 31.6411 12.2196 33.1194V31.236L10.154 33.3017L10.883 31.1145L9.54644 32.2689C9.24265 32.4511 8.5379 32.8156 8.1491 32.8156C8.29489 32.4754 8.57439 32.1068 8.6959 31.9651L6.93401 32.6334C7.13651 32.0461 7.77242 30.75 8.6959 30.264C7.43219 30.75 6.91378 30.8715 6.8125 30.8715Z\" fill=\"white\" />" +
                "<defs><linearGradient gradientUnits=\"userSpaceOnUse\" id=\"gj-splash-gradient\" x1=\"23.8612\" x2=\"23.8612\" y1=\"41.2516\" y2=\"-4.41428\">" +
                "<stop stop-color=\"" + AccentGradientStop + "\" />" +
                "<stop stop-color=\"" + Accent + "\" offset=\"1\" />" +
                "</linearGradient></defs></svg>";
        }
    }
}
