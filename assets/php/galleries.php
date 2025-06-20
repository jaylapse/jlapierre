<?php
$files = glob("gallery/home/*.{jpg,jpeg,png,gif,webp}", GLOB_BRACE);
foreach($files as $file){
    echo "<img src='$file' alt='Gallery Image' />";
}
?>