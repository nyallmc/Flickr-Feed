
//Start with empty output variable to later be used for outputting html
var output = '';
// Fire script when dom is loaded
$( document ).ready(function() {
  hideContents();

  $(".js-search").on('keyup', function (e) {
    // keycode for enter key
    if (e.keyCode == 13) {
      newTagVal = $(".js-search").val();
      if (newTagVal.length > 0) {
        newTag = '<li class="btn btn-light tag mr-1" data-tag="' + encodeURI(newTagVal) + '">' + newTagVal + ' <a href="" class="js-removeTag"><i class="fa fa-close"></i></a></li>';
        $(".js-tags").append(newTag);
        $(".js-search").val('');
        getImages();
      }
    }
  });

  $(".js-tags").on("click", ".js-removeTag", function(e){
    e.preventDefault();
    $(this).closest(".tag").remove();
    getImages();
  });

  $(".js-getFromFlickr").click(function(){
    getImages();
  });

});


/*************** FUNCTIONS ************/

// Function to get recent images
function getImages(){
  hideContents();
  showLoading();
  clearContent();
  if (getTagsUri().length > 0) {
    $.getJSON("flickr.php", { tagUri: getTagsUri()}, function(response) {
      console.log(response);
      $.each(response, function(i, item){
        constructCard(item);
      });
      hideContents();
      showContent();
    });
  } else {
    hideContents();
    showNoResults();
  }
}

function getTagsUri(){
  tagString = "";
  tags = $(".tag");
  tagLength = tags.length - 1;
  tags.each(function(i, tag){
    tagString = tagString + $(this).data("tag");
    if (i != tagLength) {
      tagString = tagString + ",";
    }
  });
  return tagString;
}

function constructCard(obj) {
  output = '';
  title = obj.title;
  thumbSrc = obj.imgSrc;
  photoUrl = obj.url;
  //Create generic untitled and no author strings if none were set on flickr
  if (title.length == 0) {
    title = "Untitled";
  }
  //TODO: Fallbacks if imgsrc or url are blank

  // Start constructing the html string to be added to the DOM later, could be done in less lines but has been seperated for readability.
  output += '<div class="card">';
  output += '<div class="card-body">';
  //Could do with using height attribute on img tag to reserve space but don't want to distort the image
  output += '<a href="' + thumbSrc + '" data-fancybox="images" class="card__image-link"><img class="card-img-top mb-3" src="' + thumbSrc + '" alt="Card image cap"><i class="fa fa-plus fa-3x" aria-hidden="true"></i></a>';
  output += '<h5 class="card-title"><a href="' + photoUrl + '" target="_blank">' + title + '</a></h5>';
  output += '</div>';
  output += '</div>';
  $(".js-cards-content").append(output);
}


// function to create a full card markup
function constructCard2(obj) {
  // Construct a url using the getInfo endpoint to get extra details not returned in initial request
  detailsEndpoint = "https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=" + apiKey + "&photo_id=" + obj.id + "&secret=" + obj.secret +"&format=json&jsoncallback=?";
  output = '';
  $.getJSON(detailsEndpoint, function(details) {
    // Store details in variables for easier use when outputting into a string
    output = '';
    description = '';
    userId = details.photo.owner.nsid;
    photoId = details.photo.id;
    description = details.photo.description._content;
    title = details.photo.title._content;
    authorName = details.photo.owner.realname;
    tags = details.photo.tags;
    //Get thumbnail source _z (medium sized image 640px on longest size). On large screens the image will generally be around 320px wide, serving a larger image ensures quality on high dpi displays
    //TODO: Research: possible to detect display quality and load smaller images on standard displays (for page performance)?
    thumbSrc = "https://farm" + obj.farm + ".staticflickr.com/" + obj.server + "/" + obj.id + "_" + obj.secret + "_z.jpg" ;
    // Get a url for the original image to be displayed in a modal if the image is clicked on
    origSrc = "https://farm" + obj.farm + ".staticflickr.com/" + obj.server + "/" + obj.id + "_" + details.photo.originalsecret + "_o." + details.photo.originalformat ;
    // Link to the original photo on flickr
    photoUrl = "https://www.flickr.com/photos/" + userId + "/" + photoId + "";
    // Link to the image owners profile on flickr
    authorUrl = "https://www.flickr.com/people/" + userId + "/" ;

    //Create generic untitled and no author strings if none were set on flickr
    if (title.length == 0) {
      title = "Untitled";
    }
    if (authorName.length == 0) {
      authorName = "Unknown";
    }

    // Start constructing the html string to be added to the DOM later, could be done in less lines but has been seperated for readability.
    output += '<div class="card">';
    output += '<div class="card-body">';
    //Could do with using height attribute on img tag to reserve space but don't want to distort the image
    output += '<a href="' + origSrc + '" data-fancybox="images" class="card__image-link"><img class="card-img-top mb-3" src="' + thumbSrc + '" alt="Card image cap"><i class="fa fa-plus fa-3x" aria-hidden="true"></i></a>';
    output += '<h5 class="card-title"><a href="' + photoUrl + '">' + title + '</a> by <span class="card-subtitle mb-2 text-muted"><a href="' + authorUrl + '">' + authorName + '</a></span></h5>';
    //Only create the description section of the card if a description exists
    if (description.length > 0) {
      //TODO: If description is too long, include a read more revealer
      if (description.length >= 250) {
        output += '<p class="card-text"><strong>Description:</strong> ' + description.substr(0, 250); + '</p>';
      } else {
        output += '<p class="card-text"><strong>Description:</strong> ' + description + '</p>';
      }
    }
    output += '</div>';
    //Only create the tags section of the card if any tags exist
    if (tags.tag.length > 0) {
      output += '<div class="card-footer">';
      output += '<small class="text-muted mr-1">Tags:';
      output += '</small>';
      $.each(tags.tag, function(i, tag){
        output += '<a href="https://www.flickr.com/photos/tags/' + tag.raw + '" class="badge badge-primary mr-1">' + tag.raw + '</a>';
      });
      output += '</div>';
    }
    output += '</div>';
    $(".js-cards-content").append(output);
  });
}

// Functions for manipulating which div is visible
function hideContents(){
  $(".js-contents .row").addClass("d-none");
}
function showLoading(){
  $(".js-cards-loading").removeClass("d-none");
}
function showContent(){
  $(".js-cards-content").removeClass("d-none");
}
function showNoResults(){
  $(".js-cards-no-results").removeClass("d-none");
}
//Empty the contents of the div where the cards are added to
function clearContent(){
  $(".js-cards-content").html("");
}
