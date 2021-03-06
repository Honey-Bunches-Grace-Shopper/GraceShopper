import React from 'react'
import {connect} from 'react-redux'
import {fetchSelectedProduct} from '../store/singleProduct'
import {addCartProduct} from '../store/cart'
import ProductForm from './Product-Form'
import AddToCartForm from './Add-To-Cart-Form'
import {updateOneProduct} from '../store/product'

const defaultState = {
  cartQuantity: 0,
  name: '',
  price: '',
  description: '',
  helpfulness: '',
  quantity: '',
  imageUrl: ''
}

class Product extends React.Component {
  constructor(props) {
    super(props)

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleProductUpdate = this.handleProductUpdate.bind(this)
    this.state = defaultState
  }

  async componentDidMount() {
    await this.props.getSelectedProduct(this.props.match.params.productId)
    await this.setState({
      name: this.props.selectedProduct.name,
      price: this.props.selectedProduct.price,
      description: this.props.selectedProduct.description,
      helpfulness: this.props.selectedProduct.helpfulness,
      quantity: this.props.selectedProduct.quantity,
      imageUrl: this.props.selectedProduct.imageUrl
    })
  }

  handleSubmit(evt) {
    evt.preventDefault()
    let loggedIn = this.props.userId
    if (loggedIn) {
      this.props.addCartProduct(
        this.props.selectedProduct,
        this.state.cartQuantity,
        this.props.userId
      )
    } else if (!localStorage.getItem(`${this.state.name}`)) {
      localStorage.setItem(`${this.state.name}`, JSON.stringify(this.state))
    } else {
      let existing = JSON.parse(localStorage.getItem(`${this.state.name}`))
      let oldQuant = Number(existing.cartQuantity) || 0
      let newQuant = Number(oldQuant) + Number(this.state.cartQuantity)
      existing.cartQuantity = newQuant
      this.setState({cartQuantity: newQuant})
      localStorage.setItem(`${this.state.name}`, JSON.stringify(existing))
    }
  }
  //handleChange handles cart submissions && product updates through state (User && Admin)
  handleChange(evt) {
    this.setState({[evt.target.name]: evt.target.value})
  }

  //handleProductUpdate handles product updates through state (Admin)
  async handleProductUpdate(evt) {
    evt.preventDefault()
    try {
      await this.props.updateProduct(this.props.selectedProduct.id, {
        name: this.state.name,
        price: this.state.price,
        description: this.state.description,
        helpfulness: this.state.helpfulness,
        quantity: this.state.quantity,
        imageUrl: this.state.imageUrl
      })
      await this.props.getSelectedProduct(this.props.selectedProduct.id)
    } catch (error) {
      console.log('error updating product')
    }
  }

  render() {
    const isAdmin = this.props.isAdmin || ''
    let {selectedProduct} = this.props || {}
    const {
      name,
      price,
      description,
      imageUrl,
      helpfulness,
      quantity
    } = selectedProduct

    return (
      <div id="singleProduct">
        <div className="singleProductInfo">
          <div>
            <img width="300px" src={imageUrl} />
          </div>
          <div className="singleProductTools">
            {!isAdmin && (
              <AddToCartForm
                handleChange={this.handleChange}
                handleSubmit={this.handleSubmit}
                state={this.state}
                quantity={quantity}
              />
            )}
          </div>
          <div className="singleProductTools">
            {isAdmin && (
              <ProductForm
                handleChange={this.handleChange}
                handleSubmit={this.handleProductUpdate}
                state={this.state}
              />
            )}
          </div>
        </div>
        <div>
          <h4>Product Details:</h4>
          <h1>{name}</h1>
          <p>{description}</p>
          <p>Helpfulness: {helpfulness}</p>
          <p>Price: ${price}</p>
        </div>
      </div>
    )
  }
}

const mapState = state => ({
  selectedProduct: state.selectedProduct,
  userId: state.user.id,
  isAdmin: state.user.admin
})

const mapDispatch = dispatch => ({
  updateProduct: (id, stock) => updateOneProduct(id, stock),
  getSelectedProduct: productId => dispatch(fetchSelectedProduct(productId)),
  addCartProduct: (product, numberOfItems, userId) =>
    dispatch(addCartProduct(product, numberOfItems, userId))
})

const SelectedProduct = connect(mapState, mapDispatch)(Product)

export default SelectedProduct
