var isStegoDone = false; 
var isExtractDone = false; 
var isChopped = false; 
var isShifted = false; 

var cnvs1 = document.getElementById("canvas1");
var cnvs2 = document.getElementById("canvas2");
var ctx1 = cnvs1.getContext("2d");
var ctx2 = cnvs2.getContext("2d");

var filename1 = document.getElementById("baseImage");
var filename2 = document.getElementById("secretImage");
var base = null;
var hide = null;
var stego = null;
var final = null;

function uploadBaseImage()
{
  base = new SimpleImage(filename1); 
  isStegoDone = false; 
  isExtractDone = false; 
  isChopped = false; 
}

function uploadSecretImage()
{
  hide = new SimpleImage(filename2); 
  isStegoDone = false; 
  isExtractDone = false; 
  isShifted = false; 
}

function doStego()
{
  if(base != null && hide != null && !isStegoDone) 
  {
    if(!isChopped)
    {
      base = chop2hide(base);
    }
    if(!isShifted)
    {
      hide = shift(hide);
    }
    stego = combine(base, hide);
    stego.drawTo(cnvs1); 
    isStegoDone = true; 
  }
}

function extractHidden()
{
  if(stego != null && !isExtractDone)
  {
    final = extract(stego);
    final.drawTo(cnvs2); 
    isExtractDone = true; 
  }
}

/* reset the least significant 4 bits of each pixel's RGB values */
function chop2hide(image)
{
  isChopped = true;
  for(var pix of image.values())
  {
    pix.setRed(Math.floor(pix.getRed() / 16) * 16);
    pix.setGreen(Math.floor(pix.getGreen() / 16) * 16);
    pix.setBlue(Math.floor(pix.getBlue() / 16) * 16);
  }
  return image;
}

/* right shift each pixel's RGB values by 4 bits */
function shift(image)
{
  isShifted = true;
  for(var pix of image.values())
  {
    pix.setRed(Math.floor(pix.getRed() / 16));
    pix.setGreen(Math.floor(pix.getGreen() / 16));
    pix.setBlue(Math.floor(pix.getBlue() / 16));
  }
  return image;
}

/* combine each pixel's RGB values of the base image and the image to be hidden */
function combine(baseImage, secretImage)
{
  var minWidth = Math.min(baseImage.getWidth(), secretImage.getWidth());
  var minHeight = Math.min(baseImage.getHeight(), secretImage.getHeight());
  baseImage = crop(baseImage, minWidth, minHeight);
  secretImage = crop(secretImage, minWidth, minHeight); 
  var resImage = new SimpleImage(baseImage.getWidth(), baseImage.getHeight()); 
  for(var pix of resImage.values())
  {
    var x = pix.getX();
    var y = pix.getY();
    var pixBase = baseImage.getPixel(x, y);  
    var pixHide = secretImage.getPixel(x, y);  
    pix.setRed(pixBase.getRed() + pixHide.getRed());
    pix.setGreen(pixBase.getGreen() + pixHide.getGreen());
    pix.setBlue(pixBase.getBlue() + pixHide.getBlue());
  }
  return resImage;
}

/* crop the image, if necessary */ 
function crop(image, width, height)
{
  var res = new SimpleImage(width, height);
  for(var pix of image.values())
  {
    var x = pix.getX();
    var y = pix.getY();
    if(x < width && y < height)
    {
      res.setPixel(x, y, pix);
    }
  }
  return res;
}

/* left shift each pixel's RGB values by 4 bits */
function extract(image)
{
  var res = new SimpleImage(image.getWidth(), image.getHeight());
  for(var pix of res.values())
  {
    var x = pix.getX();
    var y = pix.getY();
    var pixSource = image.getPixel(x, y);  
    pix.setRed((pixSource.getRed() % 16) * 16);
    pix.setGreen((pixSource.getGreen() % 16) * 16);
    pix.setBlue((pixSource.getBlue() % 16) * 16);
  }
  return res;
}

function clearCanvases()
{
  ctx1.clearRect(0, 0, cnvs1.width, cnvs1.height);
  ctx2.clearRect(0, 0, cnvs2.width, cnvs2.height);
}