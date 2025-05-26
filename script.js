const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total")
const checkOutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");
const addressInput = document.getElementById("address");
const addressWarn = document.getElementById("address-warn");
const extrasModal = document.getElementById("extras-modal");
const confirmExtrasBtn = document.getElementById("confirm-extras-btn");
const cancelExtrasBtn = document.getElementById("cancel-extras-btn");
const extrasTotalElement = document.getElementById("extras-total");


let selectedItem = null;
let cart = [];


function updateExtrasTotal() {
    if (!selectedItem) return;

    const { extrasTotal } = processExtras();
    const finalPrice = selectedItem.price + extrasTotal;

    const extrasTotalElement = document.getElementById("extras-total");
    extrasTotalElement.textContent = finalPrice.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

confirmExtrasBtn.addEventListener("click", function () {
    if (selectedItem) {
        const { extrasNames, extrasTotal } = processExtras();
        const finalPrice = selectedItem.price + extrasTotal;

        addToCart(selectedItem.name, finalPrice, extrasNames);

        selectedItem = null;

        const checkedExtras = document.querySelectorAll(".option-checkbox:checked");
        checkedExtras.forEach(cb => cb.checked = false);

        extrasModal.classList.add("hidden");
    }
});



document.querySelectorAll(".option-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", updateExtrasTotal);
});

cartBtn.addEventListener("click", function () {
    cartModal.style.display = "flex"
    updateCartModal();
});

cartModal.addEventListener("click", function (event) {
    if (event.target === cartModal) {
        cartModal.style.display = "none"
    }
});

closeModalBtn.addEventListener("click", function () {
    cartModal.style.display = "none"
});

menu.addEventListener("click", function (event) {
    let parentButton = event.target.closest(".add-to-cart-btn");

    if (parentButton) {
        const name = parentButton.getAttribute("data-name");
        const price = parseFloat(parentButton.getAttribute("data-price"));

        selectedItem = {name, price};


        if (name.toLowerCase().includes("")) {
            extrasModal.classList.remove("hidden");
        } else {

            addToCart(selectedItem.name, selectedItem.price, []);
            selectedItem = null;
        }
    }
});

function processExtras() {
    const checkedExtras = document.querySelectorAll(".option-checkbox:checked");
    const extrasNames = [];
    let extrasTotal = 0;
    let selectedFruits = 0;
    let selectedSweets = 0;

    checkedExtras.forEach((checkbox) => {
        const type = checkbox.getAttribute("data-type");
        const name = checkbox.value;
        const price = parseFloat(checkbox.getAttribute("data-price")) || 0;

        if (type === "fruit") {
            selectedFruits++;
            if (selectedFruits > 2) {
                extrasTotal += price;
            }
        } else if (type === "sweet") {
            selectedSweets++;
            if (selectedSweets > 2) {
                extrasTotal += price;
            }
        } else {
            extrasTotal += price;
        }

        extrasNames.push(name);
    });

    return { extrasNames, extrasTotal };
}

cancelExtrasBtn.addEventListener("click", function () {

    selectedItem = null;
    extrasModal.classList.add("hidden");
});

extrasModal.addEventListener("click", function (event) {
    if (event.target === extrasModal) {
        extrasModal.classList.add("hidden");
    }
});

function addToCart(name, price, extras = []) {
    const existingItem = cart.find(item =>
        item.name === name &&
        JSON.stringify(item.extras) === JSON.stringify(extras)
    );

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name,
            price,
            quantity: 1,
            extras
        });
    }

    updateCartModal();
}

function updateCartModal() {
    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        const cartItemElement = document.createElement("div");
        cartItemElement.classList.add("flex", "justify-between", "mb-4", "flex-col");

        const extrasHTML = item.extras && item.extras.length
            ? `<p class="text-sm text-gray-500">+ ${item.extras.join(", ")}</p>`
            : "";

        cartItemElement.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-medium">${item.name}</p>
                    ${extrasHTML}
                    <p>Qtd: ${item.quantity}</p>
                    <p class="font-medium mt-2">R$ ${item.price.toFixed(2)}</p>
                </div>
                <button class="remove-from-cart-btn" data-name="${item.name}" data-extras='${JSON.stringify(item.extras)}'>
                    Remover
                </button>
            </div>
        `;

        total += item.price * item.quantity;

        cartItemsContainer.appendChild(cartItemElement);
    });

    cartTotal.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    cartCounter.innerText = cart.length;

}

cartItemsContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("remove-from-cart-btn")) {
        const name = event.target.getAttribute("data-name")

        removeItemCart(name);
    }
})

function removeItemCart(name) {
    const index = cart.findIndex(item => item.name === name);

    if (index !== -1) {
        const item = cart[index];


        if (item.quantity > 1) {
            item.quantity -= 1;
            updateCartModal();
            return;
        }

        cart.splice(index, 1);
        updateCartModal();

    }

}

addressInput.addEventListener("input", function (event) {
    let inputValue = event.target.value;
    if (inputValue !== "") {
        addressWarn.classList.add("hidden")
        addressInput.classList.remove("border-red-500")
    }
})

checkOutBtn.addEventListener("click", function () {

    const isOpen = checkRestaurantOpen();
    if (!isOpen) {

        Toastify({
            text: "O restaurante está fechado",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: "#ef4444",
            },
        }).showToast();

        return;
    }

    if (cart.length === 0) return;
    if (addressInput.value === "") {
        addressWarn.classList.remove("hidden")
        addressInput.classList.add("border-red-500")


    }

});

function checkRestaurantOpen() {
    const data = new Date();
    const hora = data.getHours();
    return hora >= 9 && hora < 22;
}

const spanItem = document.getElementById("date-span")
const isOpen = checkRestaurantOpen();

if (isOpen) {
    spanItem.classList.remove("bg-red-500");
    spanItem.classList.add("bg-green-600")
} else {
    spanItem.classList.remove("bg-green-600")
    spanItem.classList.add("bg-red-500")
}

document.getElementById("checkout-btn").addEventListener("click", function () {
    const numeroWhatsApp = "5511976528267";
    const addressInput = document.getElementById("address");
    const endereco = addressInput.value.trim();

    if (!endereco) {
        document.getElementById("address-warn").classList.remove("hidden");
        return;
    } else {
        document.getElementById("address-warn").classList.add("hidden");
    }

    let mensagem = "*Pedido Realizado:*\n\n";

    cart.forEach((item, index) => {
        mensagem += `*${index + 1}. ${item.name}* - R$ ${item.price.toFixed(2)}\n`;

        if (item.extras && item.extras.length > 0) {
            mensagem += `  ➤ Extras: ${item.extras.join(", ")}\n`;
        }
        mensagem += "\n";
    });

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    mensagem += `*Total:* R$ ${total.toFixed(2)}\n\n`;
    mensagem += `*Endereço de entrega:* ${endereco}\n\n`;
    mensagem += "Aguardo a confirmação do pedido. Obrigado!";

    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");

    console.log(mensagem);
});
