'use strict'

let container = document.querySelector('.container');
let productData;
let arr = [];
loadNames();

async function loadNames() {
  let response = await fetch('./data.json');
  let names = await response.json();
  productData = names;
  names.forEach(item => {
    let product = document.createElement('div');
    product.className = 'product';
    product.innerHTML = `
      <img src='${window.innerWidth >= 768 ? item.image.desktop : item.image.mobile}'>
      <button type='button' class='add-to-cart'>Add to Cart</button>
      <p class='category'>${item.category}</p>
      <p class='name'>${item.name}</p>
      <p class='price'>$${item.price.toFixed(2)}</p>
    `
    document.querySelector('.container').append(product);
  })

  buttonPosUpdate(true);
}

window.addEventListener('resize', e => {
  document.querySelectorAll('.container .product img').forEach(img => {
    img.src = `${ window.innerWidth >= 768 
      ? productData.find(item => item.name == img.closest('.product').querySelector('.name').textContent).image.desktop 
      : productData.find(item => item.name == img.closest('.product').querySelector('.name').textContent).image.mobile }`
  });
  
  buttonPosUpdate();

  let dialog = document.querySelector('dialog');
  if(window.innerWidth <= 768) {
    let dialogCoords = dialog.getBoundingClientRect();
    if(window.innerHeight <= dialog.clientHeight) {
      dialog.style.top = window.scrollY + 'px';
      dialog.style.transform = 'translate(-50%, 0%)';
    } else {
      dialog.style.top = window.innerHeight - dialog.clientHeight + window.scrollY + 'px';
      dialog.style.transform = 'translate(-50%, 0%)';
    }
  } else {
    dialog.style.top = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
  }



  if(window.innerWidth < 400) {
    dialog.querySelectorAll('.dialog-name').forEach(item => {
      arr.push(item.textContent);
      item.textContent = item.textContent.slice(0, 14) + '...'
    })
  } else if(arr.length) {
    dialog.querySelectorAll('.dialog-name').forEach((item, index) => {
      item.textContent = arr[index];
    })
    arr.length = 0;
  }
})

container.addEventListener('mouseenter', function overBtnFunc(e) {
  if(e.target.classList.contains('add-to-cart')) {
    let btn = e.target;
    if(btn.querySelector('.product-counter')) {
      
    } else {
      let btnCoords = btn.getBoundingClientRect();
      btn.style.width = btnCoords.width + 'px';
      btn.style.height = btnCoords.height + 'px';
      btn.classList.add('hovered');
      btn.innerHTML = `
        <button class='less'>-</button>
        <span class='product-counter'>0</span>
        <button class='more'>+</button>
      `
    }

    btn.addEventListener('click', moreLessFunc)

    btn.addEventListener('mouseleave', function leaveBtnFunc(e) {
      if(btn.querySelector('.product-counter').textContent == '0') {
        btn.classList.remove('hovered');
        btn.innerHTML = 'Add to cart';
        
      } else {
        
      } 
      btn.removeEventListener('click', moreLessFunc);
      btn.removeEventListener('mouseleave', leaveBtnFunc);   
    })

    function moreLessFunc(e) {
      let cartProduct;
      if(e.target == btn.querySelector('.more')) {
        btn.querySelector('.product-counter').textContent = Number(btn.querySelector('.product-counter').textContent) + 1;
        document.querySelector('.cart-counter').textContent = Number(document.querySelector('.cart-counter').textContent) + 1;

        if(document.querySelector(`[class='${btn.closest('.product').querySelector('.name').textContent}']`)) {
          let cartProductDiv = document.querySelector(`[class='${btn.closest('.product').querySelector('.name').textContent}']`);
          cartProductDiv.querySelector('span.product-amount').textContent = `${btn.querySelector('.product-counter').textContent}x`;
          cartProductDiv.querySelector('span.product-price-total').textContent = `$${(btn.closest('.product').querySelector('.price').textContent.slice(1) * btn.querySelector('.product-counter').textContent).toFixed(2)}`
        } else {
          cartProduct = document.createElement('div');
          cartProduct.className = `${btn.closest('.product').querySelector('.name').textContent}`;
          cartProduct.innerHTML = `
          <p class='product-name'>${btn.closest('.product').querySelector('.name').textContent}</p>
          <p class='product-info'>
          <span class='product-amount'>${btn.querySelector('.product-counter').textContent}x</span>
          <span class='product-price'>@ ${btn.closest('.product').querySelector('.price').textContent}</span>
          <span class='product-price-total'>$${(btn.closest('.product').querySelector('.price').textContent.slice(1) * btn.querySelector('.product-counter').textContent).toFixed(2)}</span>
          </p>
          <button class='product-remove'>X</button>
          `
          document.querySelector('.cart-product').append(cartProduct);
          e.target.closest('.product').querySelector('img').style.borderColor = 'red';
        }
      } else if(e.target == btn.querySelector('.less') && Number(btn.querySelector('.product-counter').textContent) != 0) {
        btn.querySelector('.product-counter').textContent = Number(btn.querySelector('.product-counter').textContent) - 1;
        document.querySelector('.cart-counter').textContent = Number(document.querySelector('.cart-counter').textContent) - 1;
        let cartProductDiv = document.querySelector(`[class='${btn.closest('.product').querySelector('.name').textContent}']`);
        if(Number(btn.querySelector('.product-counter').textContent) != 0) {
          cartProductDiv.querySelector('span.product-amount').textContent = `${btn.querySelector('.product-counter').textContent}x`;
          cartProductDiv.querySelector('span.product-price-total').textContent = `$${(btn.closest('.product').querySelector('.price').textContent.slice(1) * btn.querySelector('.product-counter').textContent).toFixed(2)}`
        } else {
          e.target.closest('.product').querySelector('img').style.borderColor = '';
          cartProductDiv.remove();
        }
      }
    }
  }
}, true)

document.querySelector('.cart').addEventListener('click', e => {
  if(e.target.classList.contains('product-remove')) {
    let btn = Array.from(document.querySelectorAll(`.container .product .name`))
      .find(item => item.textContent == `${e.target.parentElement.className}`)
      .parentElement.querySelector('button.add-to-cart');
    btn.closest('.product').querySelector('img').style.borderColor = '';
    document.querySelector('.cart-counter').textContent = +document.querySelector('.cart-counter').textContent - +btn.querySelector('.product-counter').textContent;
    btn.classList.remove('hovered');
    btn.innerHTML = 'Add to cart';
    e.target.parentElement.remove();
  }
})

window.addEventListener('load', e => {
  let cartCounterObserver = new MutationObserver(mutationList => {
    for (const mutation of mutationList) {
      if(mutation.target.childNodes[0].textContent != '0') {
        document.querySelector('.cart figure').style.display = 'none';
        document.querySelector('.order-total').style.display = 'flex';
        let priceTotal = Array.from(document.querySelectorAll('span.product-price-total'))
          .reduce((acc, item) => parseFloat(item.textContent.slice(1)) + acc, 0)
        document.querySelector('.total-price').textContent = `$${priceTotal.toFixed(2)}`;
      } else if(mutation.target.childNodes[0].textContent == '0') {
        document.querySelector('.cart figure').style.display = '';
        document.querySelector('.order-total').style.display = '';
      }
    }
  })
  
  cartCounterObserver.observe(document.querySelector('.cart-counter'), { 
    childList: true, 
  })

  buttonPosUpdate();
})

document.querySelector('button.confirm').addEventListener('click', e => {
  let dialog = document.querySelector('dialog');
  dialog.showModal();
  dialog.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  for(let product of document.querySelector('.cart-product').children) {
    let dialogProduct = document.createElement('div');
    dialogProduct.className = 'dialog-product';
    dialogProduct.innerHTML = `
      <img src='${productData.find(item => item.name == product.querySelector('.product-name').textContent).image.thumbnail}'>
      <div class='dialog-info'>
      <p class='dialog-name'>${window.innerWidth >= 400
        ? product.querySelector('.product-name').textContent
        : product.querySelector('.product-name').textContent.slice(0, 14) + '...'
       }</p>
      <p class='dialog-amount'>${product.querySelector('.product-amount').textContent}
        <span class='dialog-price'>${product.querySelector('.product-price').textContent}</span>
      </p>
      </div>
      <p class='dialog-price-total'>${product.querySelector('.product-price-total').textContent}</p>
    `;
    dialog.querySelector('.dialog-order').append(dialogProduct);
  }
  let dialogOrderTotal = document.createElement('div');
  dialogOrderTotal.className = 'dialog-order-total';
  dialogOrderTotal.innerHTML = `
    <p>Order Total</p>
    <p class='total-price'><b>${document.querySelector('span.total-price').textContent}</b></p>
  `;
  dialog.querySelector('.dialog-order').append(dialogOrderTotal);
  if(window.innerWidth <= 768) {
    let dialogCoords = dialog.getBoundingClientRect();
    if(window.innerHeight <= dialog.clientHeight) {
      dialog.style.top = window.scrollY + 'px';
    } else {
      dialog.style.top = window.innerHeight - dialog.clientHeight + window.scrollY + 'px';
    }
  }
})

document.querySelector('button.new-order').addEventListener('click', e => {
  document.querySelector('dialog').close();
  document.querySelector('dialog').style.display = '';
  document.body.style.overflow = '';
  document.querySelector('.dialog-order').innerHTML = '';
  document.querySelectorAll('.product-remove').forEach(item => item.click());
})


function buttonPos(img, btn) {
  let imgCoords = img.getBoundingClientRect();
  let btnCoords = btn.getBoundingClientRect();
  btn.style.top = imgCoords.bottom - btnCoords.height / 2 + window.scrollY + 'px';
  btn.style.left = imgCoords.left + (imgCoords.width - btnCoords.width) / 2 + 'px';
}

function buttonPosUpdate(load = false) {
  let imgArr = document.querySelectorAll('.product img');
  let btnArr = document.querySelectorAll('.product button.add-to-cart');
  let arr = [];
  for(let i = 0; i < imgArr.length; i++) {
    let img = imgArr[i];
    let btn = btnArr[i];
    if(load) {
      (async () => {
        await img.decode();
        buttonPos(img, btn);
        document.querySelector('.cart').style.top = document.querySelector('article').getBoundingClientRect().top + 'px';
      })()
    } else {
      buttonPos(img, btn);
    }    
  }
}





