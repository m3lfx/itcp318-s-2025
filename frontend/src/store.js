import { legacy_createStore as createStore, combineReducers, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';

import {
    productsReducer,
    productDetailsReducer,
    newProductReducer,
    
   
} from './reducers/productReducers'
import { authReducer, 
    userReducer, 
    forgotPasswordReducer, 
} from './reducers/userReducers'



let initialState = {
    cart: {
        cartItems: localStorage.getItem('cartItems')
            ? JSON.parse(localStorage.getItem('cartItems'))
            : [],
        shippingInfo: localStorage.getItem('shippingInfo')
             ? JSON.parse(localStorage.getItem('shippingInfo'))
            : {}
    },
    user: {},
    auth: {},

}



const reducer = combineReducers({ 
    products: productsReducer,
    productDetails: productDetailsReducer,
    auth: authReducer,
    user: userReducer,
    forgotPassword: forgotPasswordReducer,
    newProduct: newProductReducer,
})

const middlware = [thunk]
const store = createStore(reducer, initialState, applyMiddleware(...middlware))
export default store;