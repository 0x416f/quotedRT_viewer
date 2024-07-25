// ==UserScript==
// @name         引用リツイート表示
// @version      1.0
// @description  Xの引用リツイート表示ボタンを設置する
// @match        https://twitter.com/*
// @match        https://mobile.twitter.com/*
// @match        https://x.com/*
// @match        https://X.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=x.com
// @grant        none
// ==/UserScript==

(function() {
    window.addEventListener("load", () => {
        console.log("view quoted tweets extension: setting up observer");

        const observer = new MutationObserver((mutationsList) => {
            for (let mutation of mutationsList) {
                if (mutation.addedNodes.length) {
                    const articles = document.querySelectorAll("article");
                    
                    // Array.from(articles)
                    //     .forEach((article) => {
                    //     setViewQuotedTweetsIcon(article);``
                    // });

                    // ステータス画面([tabindex='-1'])のツイートは除外する
                    Array.from(articles).filter(article => article.getAttribute('tabindex') === '0')
                        .forEach((article) => {
                        setViewQuotedTweetsIcon(article);``
                    });
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });

    function setViewQuotedTweetsIcon(article) {
        // If tweet already has a view quoted tweets icon, skip to the next tweet
        const quotedTweetContainerExists = article.querySelector(
            ".quoted-tweets-container"
        );
        if (quotedTweetContainerExists) {
            return;
        }

        const bookmark = article.querySelector('[data-testid="bookmark"]') || article.querySelector('[data-testid="removeBookmark"]');
        if (bookmark) {
            const bookmarkContainer = bookmark.parentNode;

            const quotedTweetsContainer = document.createElement("div");
            quotedTweetsContainer.classList.add(`quoted-tweets-container`);

            const quotedTweetsIcon = document.createElement("div");
            quotedTweetsIcon.innerHTML = `<font size="3"><b>&nbsp ℚ &nbsp</b></font>`;
            quotedTweetsIcon.addEventListener("click", (e) => {
                e.stopImmediatePropagation();
                const {
                    tweetId,
                    twitterHandle
                } = getTweetDetails(article);

                viewQuotedTweets(twitterHandle, tweetId);

                // Alternative is to simultate a twitter search
                // simulateQuoteSearch(tweetId);
            });

            quotedTweetsContainer.appendChild(quotedTweetsIcon);

            bookmarkContainer.insertAdjacentElement(
                "beforebegin",
                quotedTweetsContainer
            );
        }
    }

    function getTweetDetails(article) {
        const defaultTwitterHandle = "x";
        let twitterHandle = defaultTwitterHandle;
        let tweetId = null;

        const handleElement = article.querySelector(
            '[data-testid*="User-Name"] > div:nth-child(2)'
        );
        if (handleElement) {
            const handleMatch = handleElement.textContent.match(
                /@([a-zA-Z0-9_]+)(?:[\s·]|$)/
            );
            if (handleMatch) {
                twitterHandle = handleMatch[1];
            }
        }

        // Construct the selector based on whether a valid handle was found
        const selector = `a[href*="${
        twitterHandle !== defaultTwitterHandle ? twitterHandle : ""
        }/status"]`;

        const tweetAnchor = article.querySelector(selector);
        if (tweetAnchor) {
            const hrefParts = tweetAnchor.getAttribute("href")
            .split("/");
            tweetId = hrefParts[hrefParts.indexOf("status") + 1];
        }

        return {
            tweetId,
            twitterHandle
        };
    }

    function simulateQuoteSearch(tweetId) {
        const searchInput = document.querySelector(
            'input[data-testid="SearchBox_Search_Input"]'
        );
        // Simulate pressing the '/' key
        const keyPressEvent = new KeyboardEvent("keydown", {
            key: "/",
            code: "Slash",
            keyCode: 191, // KeyCode for '/' key
            bubbles: true,
            cancelable: true,
        });

        // Dispatch the keydown event
        searchInput.dispatchEvent(keyPressEvent);

        // Set the value of the input
        searchInput.value = `url:${tweetId}`;

        // Create and dispatch an 'input' event to signal that the value has changed
        const inputEvent = new Event("input", {
            bubbles: true
        });
        searchInput.dispatchEvent(inputEvent);

        // // Simulate enter instead of submit ------
        // const searchForm = searchInput.closest("form");
        // const submitEvent = new Event("submit", {
        //   bubbles: true,
        //   cancelable: true,
        // });

        // searchForm.dispatchEvent(submitEvent);

        // Simulate user presses the Enter key
        const enterPressEvent = new KeyboardEvent("keydown", {
            key: "Enter",
            code: "Enter",
            keyCode: 13, // KeyCode for Enter key
            bubbles: true,
            cancelable: true,
        });

        // Dispatch the keydown event for Enter key
        searchInput.dispatchEvent(enterPressEvent);
    }

    function viewQuotedTweets(twitterHandle, tweetId) {
        const newPath = `/${twitterHandle}/status/${tweetId}/quotes`;
        window.history.replaceState({}, "", newPath);
        window.dispatchEvent(new PopStateEvent("popstate", {
            state: {}
        }));
        window.scrollTo(0, 0);
    }
})();
