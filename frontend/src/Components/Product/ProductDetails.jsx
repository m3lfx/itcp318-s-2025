import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import { Carousel } from 'react-bootstrap'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getUser, getToken, successMsg, errMsg } from '../../utils/helpers';
import ListReviews from '../Review/ListReviews';
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { getProductDetails, clearErrors, newReview } from '../../actions/productActions'
import { addItemToCart } from '../../actions/cartActions'
const ProductDetails = () => {
    
    const { loading, error, product } = useSelector(state => state.productDetails);
    const { user } = useSelector(state => state.auth)
    const { error: reviewError, success } = useSelector(state => state.newReview)
    // const [product, setProduct] = useState({})
    // const [error, setError] = useState('')
    const [quantity, setQuantity] = useState(1)
    // const [cart, setCart] = useState([])
    // const [state, setState] = useState({
    //     cartItems: localStorage.getItem('cartItems')
    //       ? JSON.parse(localStorage.getItem('cartItems'))
    //       : [], 
    //   })

    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    // const [errorReview, setErrorReview] = useState('');
    // const [success, setSuccess] = useState('')
    // const [user, setUser] = useState(getUser())

    let { id } = useParams()
    let navigate = useNavigate()
    const dispatch = useDispatch()



    // const productDetails = async (id) => {
    //     let link = `http://localhost:4001/api/v1/product/${id}`
    //     try {
    //         let res = await axios.get(link)
    //         setProduct(res.data.product)


    //     } catch (err) {
    //         console.log(err)
    //         setError('Product not found')


    //     }
    // }

    const increaseQty = () => {
        const count = document.querySelector('.count')
        if (count.valueAsNumber >= product.stock) return;
        const qty = count.valueAsNumber + 1;
        setQuantity(qty)
    }

    const decreaseQty = () => {
        const count = document.querySelector('.count')
        if (count.valueAsNumber <= 1) return;
        const qty = count.valueAsNumber - 1;
        setQuantity(qty)
    }

    // const addItemToCart = async (id, quantity) => {
    //     // console.log(id, quantity)
    //     try {
    //       const { data } = await axios.get(`${import.meta.env.VITE_API}/product/${id}`)
    //       const item = {
    //         product: data.product._id,
    //         name: data.product.name,
    //         price: data.product.price,
    //         image: data.product.images[0].url,
    //         stock: data.product.stock,
    //         quantity: quantity
    //       }

    //       const isItemExist = state.cartItems.find(i => i.product === item.product)
    //       console.log( state)
    //       setState({
    //         ...state,
    //         cartItems: [...state.cartItems, item]
    //       })
    //       if (isItemExist) {
    //         setState({
    //           ...state,
    //           cartItems: state.cartItems.map(i => i.product === isItemExist.product ? item : i)
    //         })
    //       }
    //       else {
    //         setState({
    //           ...state,
    //           cartItems: [...state.cartItems, item]
    //         })
    //       }

    //       toast.success('Item Added to Cart', {
    //         position: 'bottom-right'
    //       })

    //     } catch (error) {
    //       toast.error(error, {
    //         position: 'top-left'
    //       });
    //       navigate('/')
    //     }

    //   }


    const addToCart = async () => {
       dispatch(addItemToCart(id, quantity));

    }

    function setUserRatings() {
        const stars = document.querySelectorAll('.star');
        stars.forEach((star, index) => {
            star.starValue = index + 1;
            ['click', 'mouseover', 'mouseout'].forEach(function (e) {
                star.addEventListener(e, showRatings);
            })
        })
        function showRatings(e) {
            stars.forEach((star, index) => {
                if (e.type === 'click') {
                    if (index < this.starValue) {
                        star.classList.add('orange');
                        setRating(this.starValue)
                    } else {
                        star.classList.remove('orange')
                    }
                }
                if (e.type === 'mouseover') {
                    if (index < this.starValue) {
                        star.classList.add('yellow');
                    } else {
                        star.classList.remove('yellow')
                    }
                }
                if (e.type === 'mouseout') {
                    star.classList.remove('yellow')
                }
            })
        }
    }

    // const newReview = async (reviewData) => {
    //     try {
    //         const config = {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${getToken()}`
    //             }
    //         }

    //         const { data } = await axios.put(`${import.meta.env.VITE_API}/review`, reviewData, config)
    //         setSuccess(data.success)

    //     } catch (error) {
    //         setErrorReview(error.response.data.message)
    //     }
    // }

    const reviewHandler = () => {
        const formData = new FormData();
        formData.set('rating', rating);
        formData.set('comment', comment);
        formData.set('productId', id);
        dispatch(newReview(formData))

    }

    // useEffect(() => {
    //     dispatch(getProductDetails(id))
    //     if (error) {
    //         navigate('/')
    //         // setError('')
    //     }

    //     if (errorReview) {
    //         errMsg(errorReview)
    //         setErrorReview('')
    //     }
    //     if (success) {
    //         successMsg('Review posted successfully')
    //         setSuccess(false)

    //     }
    // }, [id, error, errorReview, success]);
    // console.log(state)
    // localStorage.setItem('cartItems', JSON.stringify(cartItems))
    useEffect(() => {
        dispatch(getProductDetails(id))
        if (error) {
            // notify(error)
            dispatch(clearErrors())
        }
        if (reviewError) {
            dispatch(clearErrors())
        }
        if (success) {
            successMsg('Review posted successfully')
            // setSuccess(false)

        }
    }, [id, error, success, reviewError, dispatch, navigate]);
    return (
        <>
            <MetaData title={product.name} />
            <div className="row d-flex justify-content-around">
                <div className="col-12 col-lg-5 img-fluid" id="product_image">
                    <Carousel pause='hover'>
                        {product.images && product.images.map(image => (
                            <Carousel.Item key={image.public_id}>
                                <img className="d-block w-100" src={image.url} alt={product.title} />
                            </Carousel.Item>
                        ))}
                    </Carousel>
                </div>

                <div className="col-12 col-lg-5 mt-5">
                    <h3>{product.name}</h3>
                    <p id="product_id">Product # {product._id}</p>

                    <hr />

                    <div className="rating-outer">
                        <div className="rating-inner" style={{ width: `${(product.ratings / 5) * 100}%` }}></div>
                    </div>
                    <span id="no_of_reviews">({product.numOfReviews} Reviews)</span>

                    <hr />

                    <p id="product_price">${product.price}</p>
                    <div className="stockCounter d-inline">
                        <span className="btn btn-danger minus" onClick={decreaseQty}>-</span>

                        <input type="number" className="form-control count d-inline" value={quantity} readOnly />

                        <span className="btn btn-primary plus" onClick={increaseQty}>+</span>
                    </div>
                    {/* <div className="stockCounter d-inline">

                        <span className="btn btn-danger minus" >-</span>

                        <input type="number" className="form-control count d-inline" readOnly />


                        <span className="btn btn-primary plus" >+</span>
                    </div> */}

                    {/* <button type="button" id="cart_btn" className="btn btn-primary d-inline ml-4" disabled={product.stock === 0} >Add to Cart</button> */}
                    <button type="button" id="cart_btn" className="btn btn-primary d-inline ml-4" disabled={product.stock === 0} onClick={addToCart}>Add to Cart</button>
                    <hr />

                    <p>Status: <span id="stock_status" className={product.stock > 0 ? 'greenColor' : 'redColor'} >{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span></p>

                    <hr />

                    <h4 className="mt-2">Description:</h4>
                    <p>{product.description}</p>
                    <hr />
                    <p id="product_seller mb-3">Sold by: <strong>{product.seller}</strong></p>
                    {user ? <button id="review_btn" type="button" className="btn btn-primary mt-4" data-toggle="modal" data-target="#ratingModal" onClick={setUserRatings} >
                        Submit Your Review
                    </button> :
                        <div className="alert alert-danger mt-5" type='alert'>Login to post your review.</div>}
                    <div className="row mt-2 mb-5">
                        <div className="rating w-50">

                            <div className="modal fade" id="ratingModal" tabIndex="-1" role="dialog" aria-labelledby="ratingModalLabel" aria-hidden="true">
                                <div className="modal-dialog" role="document">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title" id="ratingModalLabel">Submit Review</h5>
                                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </div>
                                        <div className="modal-body">

                                            <ul className="stars" >
                                                <li className="star"><i className="fa fa-star"></i></li>
                                                <li className="star"><i className="fa fa-star"></i></li>
                                                <li className="star"><i className="fa fa-star"></i></li>
                                                <li className="star"><i className="fa fa-star"></i></li>
                                                <li className="star"><i className="fa fa-star"></i></li>
                                            </ul>

                                            <textarea
                                                name="review"
                                                id="review" className="form-control mt-3"
                                            
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}>
                                            </textarea>


                                            <button className="btn my-3 float-right review-btn px-4 text-white" data-dismiss="modal" aria-label="Close" onClick={reviewHandler}>Submit</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                    { product.reviews && product.reviews.length > 0 && (

<ListReviews reviews={product.reviews} />

)}
                </div>
            </div>


        </>
    )
}

export default ProductDetails