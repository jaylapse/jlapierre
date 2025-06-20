<?php
<div id="gallery-photos" class="gallery-cards-container">
<?php
// Set the folder based on the gallery you want to show
// You can make this dynamic with a query string or variable if needed
$galleryFolder = '/gallery/Home/'; // Change as needed, e.g. 'gallery/Thunder Bay ON/'

$files = glob($galleryFolder . "*.{jpg,jpeg,png,gif,webp}", GLOB_BRACE);
foreach($files as $file){
    echo "<div class='gallery-card'>";
    echo "<a href='/$file' data-lightbox='gallery'><img src='/$file' alt='Gallery Image' class='gallery-card-img' loading='lazy' /></a>";
    echo "</div>";
}
?>
</div>