
var eventBus = new Vue()
Vue.component('product-tabs', {
    props:{
        reviews:{
            type:Array,
            required : true
        }
    },
    template: `
    <div>
        <div>
            <span class="tab"
            :class="{activeTab : selectedTab === tab}"
            v-for="(tab,index) in tabs" :key="index"
            @click="selectedTab = tab"
            >
            {{tab}}
            </span>
        </div>
        <div v-show="selectedTab === 'Reviews'">
        <p v-if="reviews.length==0">Threre are no reviews yet.</p>
        <ul>
            <li v-for="review in reviews">
            <p>{{review.name}}</p>
            <p>{{review.review}}</p>
            <p>Rating : {{review.rating}}</p>
            </li>
        </ul>
        </div>
        
   
        <product-review v-show="selectedTab === 'Make a review'"></product-review>
     </div>
    `,
    data(){
        return{
            tabs:['Reviews', 'Make a review'],
            selectedTab : 'Reviews'
        }
    }
})
Vue.component('product-review', {
    template: `
        <div>
            <form class="review-form" @submit.prevent="onSubmit">
            <p v-if="errors.length">
                <b> Please correct the following errors(s):</b>
                <ul>
                    <li v-for="error in errors">{{error}}</li>
                </ul>
            </p>
            <p>

                <label for="name">Name:</label>
                <input id="name" v-model="name">
            </p>
            <p>
                <label for="review">Review: </label>
                <textarea id="review" v-model="review" ></textarea>
            </p>
            <p>
                <label for="rating">Rating:</label>
                <select id="rating" v-model.number="rating">
                    <option>5</option>
                    <option>4</option>
                    <option>3</option>
                    <option>2</option>
                    <option>1</option>
                </select>
            </p>
            <p>
                <input type="submit" value="Submit">
            </p>
            </form>
        </div>
    `,
    data(){
        return{
            name : null,
            review: '',
            rating : '',
            errors: []
        }
    },
    methods:{
        onSubmit(){
            this.errors = []
                
            if(this.name && this.review && this.rating)
            {
                let productReview = {
                    name : this.name,
                    review : this.review,
                    rating : this.rating
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
            }else{
                if(!this.name) this.errors.push("Name required.")
                if(!this.review) this.errors.push("review required.")
                if(!this.rating) this.errors.push("rating required.")
            }
            
        }
    }
})
Vue.component('product', {
    props: {
        premium : {
            type : Boolean,
            required: true
        }
    },
    template : `
    <div>
    <div class="product">
    <div class="product-image">
        <!-- <img v-bind:src="image"> is same as below-->
            <img :src="image">
    </div>
    </div>
    <div class="product-info">
    <h1>{{title}}</h1>
    <p v-if="inStock > 10">In Stock</p>
    <p v-else-if = "inStock > 0 && inStock <=10"> Almost sold out</p>
    <p v-else :class="[inStock ? activeClass: '' ]">Out of Stock</p>
    <h3 v-if = "onSale">On Sale!</h3>
    <p>Shipping : {{shipping}}</p>
    <ul>
        <li v-for="detail in details">{{detail}}</li>
    </ul>
    <div v-for="(v,i) in variants" 
    :key="v.variantId"
    class="color-box"
    :style="{backgroundColor: v.variantColor}"
    @mouseover="updateProduct(i)">
    </div>
    <button v-on:click="addToCart"
    :disabled = "this.variants[this.selectedVariant].variantQuantity==0"
    :class="{disabledButton: !this.variants[this.selectedVariant].variantQuantity}">Add to Cart</button>
    <button v-on:click="takeOutFromCart">Take Out from Cart</button>
    <product-tabs :reviews="reviews"></product-tabs>
    </div>
    </div>
    ` ,
    data() {
        return{
        product : "Socks",
        brand: 'Vue Mastery',
        selectedVariant: 0 ,
        inventory : 11,
        onSale  : true,
        details : ["80% cottons", "20% polyester", "Gender-neutral"],
        variants: [
            {
                variantId : 2234,
                variantColor: "green",
                variantImage: "./assets/vmSocks-green.jpg",
                variantQuantity: 10
            },
            {
                variantId : 2235,
                variantColor: "blue",
                variantImage: "./assets/vmSocks-blue.jpg",
                variantQuantity : 0
            }
        ],
        cart : 0,
        activeClass : "text-decoration: line-through",
        reviews : []
        }
        
        
    },
    methods: {
        addToCart : function(){
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
            this.variants[this.selectedVariant].variantQuantity -= 1
            if(this.variants[this.selectedVariant].variantQuantity != 0)
            {
                this.onSale  = true
            }
            else
            {
                this.onSale  = false
            }
                
        },
        updateProduct: function(index)
        {
            this.selectedVariant = index
            if(this.variants[this.selectedVariant].variantQuantity == 0)
                this.onSale = false
            else
                this.onSale = true
            
        },
        takeOutFromCart: function(){
            this.$emit('takeout-from-cart')
            this.variants[this.selectedVariant].variantQuantity += 1 
            if(this.variants[this.selectedVariant].variantQuantity != 0)
            {
                this.onSale  = true
                
            }
            else
            {
                this.onSale  = false
            }
                
        }
    },
    computed:{
        title(){
            return this.brand + ' '+ this.product
        },
        image()
        {
            return this.variants[this.selectedVariant].variantImage
        },
        inStock()
        {
            return this.variants[this.selectedVariant].variantQuantity
        },
        shipping()
        {
            if(this.premium)
                return "Free"
            else
                return "$2.99"
        }
    },
    mounted(){
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
          })
    }


})
var app = new Vue({
    el : '#app',
    data : {
        premium : true,
        cart : []
    },
    methods : {
        updateCart(id){
            this.cart.push(id)
        },
        takeOutFromCart()
        {
            if(this.cart.length > 0)
            {
                this.cart.pop()
                     
            }
        }
    }
    
})