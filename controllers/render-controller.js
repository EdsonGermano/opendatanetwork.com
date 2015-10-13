var ApiController = require('./api-controller');
var CategoryController = require('./category-controller');
var TagController = require('./tag-controller');

var apiController = new ApiController();
var categoryController = new CategoryController();
var tagController = new TagController();

module.exports = RenderController;

function RenderController() {
};

// Public methods
//
RenderController.prototype.renderErrorPage = function(req, res) {

    res.status(503);
    res.sendFile(__dirname + '/views/static/error.html');
};

RenderController.prototype.renderHomePage = function (req, res) {

    apiController.getCategoriesAll(function(allCategoryResults) {

        categoryController.attachCategoryMetadata(allCategoryResults, function(allCategoryResults) {

            // Set the tooltips shown cookie
            //
            res.cookie('tooltips-shown', '1', { expires: new Date(Date.now() + (1 * 24 * 60 * 60 * 1000)), httpOnly: true }); // one day

            // Get params
            //
            var params = apiController.getSearchParameters(req.query);

            // Render page
            //
            res.render(
                'v3-home.ejs', 
                {
                    css : ['/styles/v3-home.min.css', '//cdn.jsdelivr.net/jquery.slick/1.5.0/slick.css'],
                    scripts : [
                        '/scripts/v3-home.min.js', 
                        '//cdn.jsdelivr.net/jquery.slick/1.5.0/slick.min.js', 
                        {
                            'url' : '//fast.wistia.net/static/popover-v1.js',
                            'charset' : 'ISO-8859-1'
                        }],
                    params : params,
                    allCategoryResults : allCategoryResults,
                    tooltips : (req.cookies['tooltips-shown'] != '1'),
                });
        });
    }, function() { renderErrorPage(req, res); });
};

RenderController.prototype.renderJoinOpenDataNetwork = function(req, res) {

    res.locals.css = 'join.min.css';
    res.locals.title = 'Join the Open Data Network.';
    res.render('join.ejs');
};

RenderController.prototype.renderJoinOpenDataNetworkComplete = function(req, res) {

    res.locals.css = 'join-complete.min.css';
    res.locals.title = 'Thanks for joining the Open Data Network.';
    res.render('join-complete.ejs');
};

RenderController.prototype.renderSearchPage = function(req, res) {

    var defaultFilterCount = 10;
    var params = apiController.getSearchParameters(req.query);

    // Get all categories for the header menus
    //
    apiController.getCategoriesAll(function(allCategoryResults) {

        categoryController.attachCategoryMetadata(allCategoryResults, function(categoryResults) {

            // Get the current category
            //
            var currentCategory = categoryController.getCurrentCategory(params, allCategoryResults);

            // Get all tags
            //
            apiController.getTagsAll(function(allTagResults) {

                tagController.attachTagMetadata(allTagResults, function(tagResults) {

                    // Get the current tag
                    //
                    var currentTag = tagController.getCurrentTag(params, allTagResults);

                    // Get the categories for the filter menus
                    //
                    var filterCategoryCount = params.ec ? null : defaultFilterCount;
                    apiController.getCategories(filterCategoryCount, function(filterCategoryResults) {
        
                        // Get the domains for the filter menus
                        //
                        var domainCount = params.ed ? null : defaultFilterCount;
                        apiController.getDomains(domainCount, function(filterDomainResults) {
        
                            // Get the tags for the filter menus
                            //
                            var tagCount = params.et ? null : defaultFilterCount;
                            apiController.getTags(tagCount, function(filterTagResults) {
        
                                // Do the search
                                //
                                apiController.search(params, function(searchResults) {
        
                                    res.render(
                                        'v4-search.ejs', 
                                        { 
                                            css : ['/styles/v3-search.min.css'],
                                            scripts : ['/scripts/v3-search.min.js'],
                                            params : params,
                                            currentCategory : currentCategory,
                                            currentTag : currentTag,
                                            allCategoryResults : allCategoryResults,
                                            filterCategoryResults : filterCategoryResults,
                                            filterDomainResults : filterDomainResults,
                                            filterTagResults : filterTagResults,
                                            searchResults : searchResults,
                                            showcaseResults : [],
                                            tooltips : false,
                                        });
                                }, function() { renderErrorPage(req, res) }); // apiController.search
                            }, function() { renderErrorPage(req, res) }); // apiController.getTags
                        }, function() { renderErrorPage(req, res) }); // apiController.getDomains
                    }, function() { renderErrorPage(req, res) }); // apiController.getCategories
                }); // tagController.attachTagMetadata
            }, function() { renderErrorPage(req, res); }); // apiController.getTagsAll
        }); // categoryController.attachCategoryMetadata
    }, function() { renderErrorPage(req, res); }); // apiController.getCategoriesAll
};

RenderController.prototype.renderSearchResults = function(req, res) {

    var params = apiController.getSearchParameters(req.query);

    apiController.search(params, function(searchResults) {

        if (searchResults.results.length == 0) {

            res.status(204);
            res.end();
            return;
        }

        res.render(
            'v3-search-results.ejs',
            {
                css : [],
                scripts : [],
                params : params,
                searchResults : searchResults,
            });
    });
};