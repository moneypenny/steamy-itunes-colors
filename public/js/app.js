var ImageAnalyzer = function(image, callback) {
  var bgcolor, detailColor, findEdgeColor, findTextColors, init, isBlackOrWhite, isContrastingColor, isDarkColor, isDistinct, primaryColor, secondaryColor;
  bgcolor = primaryColor = secondaryColor = detailColor = null;
  init = function(image, callback) {
    var img;
    img = new Image();
    img.src = image;
    return img.onload = function() {
      var ctx, cvs;
      cvs = document.createElement('canvas');
      cvs.width = img.width;
      cvs.height = img.height;
      ctx = cvs.getContext('2d');
      ctx.drawImage(img, 0, 0);
      bgcolor = findEdgeColor(cvs, ctx);
      return findTextColors(cvs, ctx, function() {
        return callback(bgcolor, primaryColor, secondaryColor, detailColor);
      });
    };
  };
  init(image, callback);
  findEdgeColor = function(cvs, ctx) {
    var blue, color, colorCount, count, green, index, leftEdgeColors, nextProposedEdgeColor, pixel, proposedEdgeColor, red, sortedColorCount, _i, _j, _len, _ref;
    leftEdgeColors = ctx.getImageData(0, 0, 1, cvs.height);
    colorCount = {};
    for (pixel = _i = 0, _ref = cvs.height; 0 <= _ref ? _i < _ref : _i > _ref; pixel = 0 <= _ref ? ++_i : --_i) {
      red = leftEdgeColors.data[pixel * 4];
      green = leftEdgeColors.data[pixel * 4 + 1];
      blue = leftEdgeColors.data[pixel * 4 + 2];
      index = red + ',' + green + ',' + blue;
      if (!colorCount[index]) {
        colorCount[index] = 0;
      }
      colorCount[index]++;
    }
    sortedColorCount = [];
    for (color in colorCount) {
      count = colorCount[color];
      if (count > 2) {
        sortedColorCount.push([color, count]);
      }
    }
    sortedColorCount.sort(function(a, b) {
      return b[1] - a[1];
    });
    proposedEdgeColor = sortedColorCount[0];
    if (isBlackOrWhite(proposedEdgeColor[0])) {
      for (_j = 0, _len = sortedColorCount.length; _j < _len; _j++) {
        nextProposedEdgeColor = sortedColorCount[_j];
        if (nextProposedEdgeColor[1] / proposedEdgeColor[1] > 0.3) {
          if (!isBlackOrWhite(nextProposedEdgeColor[0])) {
            proposedEdgeColor = nextProposedEdgeColor;
            break;
          }
        }
      }
    }
    return proposedEdgeColor[0];
  };
  findTextColors = function(cvs, ctx, cb) {
    var blue, color, colorCount, colors, column, count, curDark, defaultColor, findDarkTextColor, green, index, possibleColorsSorted, red, row, _i, _j, _k, _len, _ref, _ref1;
    colors = ctx.getImageData(0, 0, cvs.width, cvs.height);
    findDarkTextColor = !isDarkColor(bgcolor);
    colorCount = {};
    for (row = _i = 0, _ref = cvs.height; 0 <= _ref ? _i < _ref : _i > _ref; row = 0 <= _ref ? ++_i : --_i) {
      for (column = _j = 0, _ref1 = cvs.width; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; column = 0 <= _ref1 ? ++_j : --_j) {
        red = colors.data[(row * (cvs.width * 4)) + (column * 4)];
        green = colors.data[((row * (cvs.width * 4)) + (column * 4)) + 1];
        blue = colors.data[((row * (cvs.width * 4)) + (column * 4)) + 2];
        index = red + ',' + green + ',' + blue;
        if (!colorCount[index]) {
          colorCount[index] = 0;
        }
        colorCount[index]++;
      }
    }
    possibleColorsSorted = [];
    for (color in colorCount) {
      count = colorCount[color];
      curDark = isDarkColor(color);
      if (curDark === findDarkTextColor) {
        possibleColorsSorted.push([color, count]);
      }
    }
    possibleColorsSorted.sort(function(a, b) {
      return b[1] - a[1];
    });
    for (_k = 0, _len = possibleColorsSorted.length; _k < _len; _k++) {
      color = possibleColorsSorted[_k];
      if (!primaryColor) {
        if (isContrastingColor(color[0], bgcolor)) {
          primaryColor = color[0];
        }
      } else if (!secondaryColor) {
        if (!isDistinct(primaryColor, color[0]) || !isContrastingColor(color[0], bgcolor)) {
          continue;
        }
        secondaryColor = color[0];
      } else if (!detailColor) {
        if (!isDistinct(secondaryColor, color[0]) || !isDistinct(primaryColor, color[0]) || !isContrastingColor(color[0], bgcolor)) {
          continue;
        }
        detailColor = color[0];
        break;
      }
    }
    defaultColor = findDarkTextColor ? "0,0,0" : "255,255,255";
    if (!primaryColor) {
      primaryColor = defaultColor;
    }
    if (!secondaryColor) {
      secondaryColor = defaultColor;
    }
    if (!detailColor) {
      detailColor = defaultColor;
    }
    return cb();
  };
  isBlackOrWhite = function(color) {
    var blue, green, red, splitted, tresholdBlack, tresholdWhite;
    splitted = color.split(',');
    red = splitted[0];
    green = splitted[1];
    blue = splitted[2];
    tresholdWhite = 255 * 0.91;
    tresholdBlack = 255 * 0.09;
    if (red > tresholdWhite && green > tresholdWhite && blue > tresholdWhite) {
      return true;
    }
    if (red < tresholdBlack && green < tresholdBlack && blue < tresholdBlack) {
      return true;
    }
    return false;
  };
  isDarkColor = function(color) {
    var blue, green, lum, red, splitted;
    if (color) {
      splitted = color.split(',');
      red = splitted[0] / 255;
      green = splitted[1] / 255;
      blue = splitted[2] / 255;
      lum = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
      return lum < 0.5;
    }
    return false;
  };
  isContrastingColor = function(color1, color2) {
    var blue1, blue2, contrast, green1, green2, lum1, lum2, red1, red2, splitted1, splitted2;
    splitted1 = color1.split(',');
    red1 = splitted1[0] / 255;
    green1 = splitted1[1] / 255;
    blue1 = splitted1[2] / 255;
    lum1 = 0.2126 * red1 + 0.7152 * green1 + 0.0722 * blue1;
    splitted2 = color2.split(',');
    red2 = splitted2[0] / 255;
    green2 = splitted2[1] / 255;
    blue2 = splitted2[2] / 255;
    lum2 = 0.2126 * red2 + 0.7152 * green2 + 0.0722 * blue2;
    if (lum1 > lum2) {
      contrast = (lum1 + 0.05) / (lum2 + 0.05);
    } else {
      contrast = (lum2 + 0.05) / (lum1 + 0.05);
    }
    return contrast > 1.6;
  };
  return isDistinct = function(color1, color2) {
    var blue1, blue2, green1, green2, red1, red2, splitted1, splitted2, treshold;
    splitted1 = color1.split(',');
    red1 = splitted1[0] / 255;
    green1 = splitted1[1] / 255;
    blue1 = splitted1[2] / 255;
    splitted2 = color2.split(',');
    red2 = splitted2[0] / 255;
    green2 = splitted2[1] / 255;
    blue2 = splitted2[2] / 255;
    treshold = 0.25;
    if (Math.abs(red1 - red2) > treshold || Math.abs(green1 - green2) > treshold || Math.abs(blue1 - blue2) > treshold) {
      if (Math.abs(red1 - green1) < .03 && Math.abs(red1 - blue1) < .03) {
        if (Math.abs(red2 - green2) < .03 && Math.abs(red2 - blue2) < .03) {
          return false;
        }
      }
      return true;
    }
    return false;
  };
};
function setColorsFromImage() {
  var originalUrl = $('.steam-screenshot').attr('src');
  var url = '/image?url=' + encodeURIComponent(originalUrl);
  var imageList = $('.pagination');
  ImageAnalyzer(url, function(background, primary, secondary, accent) {
    $('body').css('background-color', 'rgb(' + background + ')').
              css('color', 'rgb(' + primary + ')');
    $('h1').css('color', 'rgb(' + accent + ')');
    $('h2').css('color', 'rgb(' + secondary + ')');
    $('.screenshot-wrapper').fadeIn('fast');
    if (imageList.find('li').length > 1) {
      imageList.fadeIn('fast');
    }
  });
}
function listImages(rss) {
  var imageList = $('.pagination');
  var pageNumber = 1;
  var steamScreenshot = $('.steam-screenshot');
  $(rss).find('entry').each(function() {
    var entry = $(this);
    var imageUrl = entry.find('summary').text();
    var li = $('<li>');
    li.addClass('waves-effect');
    if (pageNumber === 1) {
      li.addClass('active');
      steamScreenshot.attr('src', imageUrl);
      setColorsFromImage();
    }
    var link = $('<a>');
    link.attr('href', '#').attr('data-image', imageUrl);
    link.text(pageNumber);
    li.append(link);
    pageNumber++;
    imageList.append(li);
  });
}
$(function() {
  var rssServiceUrl;
  $.getJSON('/config.json', function(config) {
    rssServiceUrl = config.rssServiceUrl;
    $('.steam-user-lookup-form').fadeIn('fast');
  }).error(function(jqXHR, textStatus, error) {
    $('.error-message').text('Failed to load config.json').fadeIn('fast');
  });
  $('.steam-user-lookup-form').on('submit', function(event) {
    event.preventDefault();
    $(this).fadeOut('fast');
    var steamUser = $('#steam-user-name').val();
    var feedUrl = rssServiceUrl + '?user=' + encodeURIComponent(steamUser);
    $.get(feedUrl, function(rss) {
      listImages(rss);
    });
  });
});
