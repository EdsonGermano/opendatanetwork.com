'use strict';

$(document).ready(function() {
    autosuggest();
    tooltip();
    refineMenus();
    apiBadges();
    infiniteScroll();

    // Selected category (yellow box)
    $('.current-category-info-box .fa-close').click(() => {
        $('.current-category-info-box').slideUp();
    });

    $(window).resize(onResize);
    onResize();
});

function onResize() {
    renderEntities(_data.entities);
}

function autosuggest() {
    new Autosuggest('.region-list').listen('.search-bar-input');
}

function tooltip() {
    $('.info-icon').mouseenter(() => {
        $('.info-tooltip').fadeIn();
    });

    $('.info-icon').mouseleave(() => {
        $('.info-tooltip').fadeOut();
    });
}

function refineMenus() {
    $('.refine-link').mouseenter(function() {
        $(this).addClass('refine-link-selected');
        $(this).children('span').children('i').removeClass('fa-caret-down').addClass('fa-caret-up');
        $(this).children('ul').show();

    });

    $('.refine-link').mouseleave(function() {
        $(this).removeClass('refine-link-selected');
        $(this).children('span').children('i').removeClass('fa-caret-up').addClass('fa-caret-down');
        $(this).children('ul').hide();
    });
}

function refineControls() {
    new RefineControlsMobile();
    new SearchRefineControlsMobile();
}

function renderEntities(entities) {
    if (entities.length === 0) return;

    const container = d3.select('.search-results-regions');
    container.html('');

    const columns = getColumnCount(entities.length);
    _.chunk(entities, columns).forEach(dataRow => {
        const row = container
            .append('div')
            .attr('class', 'search-results-regions-row');

        dataRow.forEach(entity => {
            const cell = row.append('div');

            cell.append('h2')
                .append('a')
                .attr('href', new EntityNavigate().to(entity).url())
                .text(entity.name);

            if (columns == 3)
                cell.attr('class', 'search-results-regions-cell w33');
            else if (columns == 2)
                cell.attr('class', 'search-results-regions-cell w50');
            else
                cell.attr('class', 'search-results-regions-cell');

            cell.append('div')
                .attr('class', 'regionType')
                .text(GlobalConstants.REGION_NAMES[entity.type] || '');
        });
    });
}

function getColumnCount(count) {
    const width = $(document).width();
    const widthForThree = 1200;
    const widthForTwo = 800;

    if (count >= 3) {
        if (width >= widthForThree) return 3;
        if (width >= widthForTwo) return 2;
        return 1;
    }

    if (count >= 2) return width >= widthForTwo ? 2 : 1;

    return 1;
}

function apiBadges() {
    const query = _data.query;
    const url = `http://api.us.socrata.com/api/catalog/v1?q=${query}`;
    const apiaryURL = 'http://docs.socratadiscovery.apiary.io/#';
    const description = `Full text search for ${query}`;
    const popup = new APIPopup(description, '/catalog', url, apiaryURL);
    const badge = new APIBadge(popup);

    popup.appendTo(d3.select('#catalog-info-box'));
    badge.insertAt(d3.select('.refine-bar.search-header-bar'));
}

function infiniteScroll() {
    let working = false;
    const datasetIterator = getDatasetIterator();
    const $datasets = $('.datasets');

    $(window).on('scroll', () => {
        if (shouldScroll() && !working) {
            working = true;

            datasetIterator.next().then(datasets => {
                $datasets.append(datasets);
                working = false;
            });
        }
    }).scroll();
}

function getDatasetIterator() {
    const query = _data.query;
    const categories = _data.categories;
    const domains = _data.domains;
    const tags = _data.tags;

    return new DatasetIterator(query, categories, domains, tags);
}

class DatasetIterator {
    constructor(query, categories, domains, tags) {
        this.page = 0;
        this.limit = 10;
    }

    next() {
        this.page++;
        return d3.promise.html(this.nextURL());
    }

    nextURL() {
        return buildURL('/search-results', {
            q: this.query,
            categories: this.categories,
            domains: this.domains,
            tags: this.tags,
            limit: this.limit,
            offset: this.page * this.limit
        });
    }
}

function shouldScroll() {
    return ($(window).scrollTop() >=
            $(document).height() - $(window).height() - GlobalConstants.SCROLL_THRESHOLD);
}


