import React from 'react'
import {connect} from 'react-redux'
// import product from '../store/product'
import {fetchSelectedProduct} from '../store/singleProduct'
import {addCartProduct} from '../store/cart'
// import {getUser} from '../store/user'
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
  //handleSubmit handles cart submissions (User)
  handleSubmit(evt) {
    evt.preventDefault()
    let loggedIn = this.props.userId
    if (loggedIn) {
      this.props.addCartProduct(
        this.props.selectedProduct,
        this.state.cartQuantity,
        this.props.userId
      )
    } else {
      // eslint-disable-next-line no-lonely-if
      if (!localStorage.getItem(`${this.state.name}`)) {
        console.log('in the if')
        localStorage.setItem(`${this.state.name}`, JSON.stringify(this.state))
      } else {
        let existing = JSON.parse(localStorage.getItem(`${this.state.name}`))
        let oldQuant = Number(existing.cartQuantity) || 0
        let newQuant = Number(oldQuant) + Number(this.state.cartQuantity)
        existing.cartQuantity = newQuant

        console.log('this.state.cartQuantity', this.state.cartQuantity)
        console.log('existing', existing)
        console.log('oldQuant', oldQuant)
        console.log('newQuant', newQuant)
        this.setState({cartQuantity: newQuant})
        console.log('this.state.cartQuantity after', this.state.cartQuantity)

        localStorage.setItem(`${this.state.name}`, JSON.stringify(existing))
      }
    }
  }
  //handleChange handles cart submissions && product updates through state (User && Admin)
  handleChange(evt) {
    this.setState({[evt.target.name]: evt.target.value})
  }

  //handleProductUpdate handles product updates through state (Admin)
  async handleProductUpdate(evt) {
    console.log('click')
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
        <img width="300px" src={imageUrl} />
        <div>
          <h3>{name}</h3>
          <p>{description}</p>
          <p>Helpfulness: {helpfulness}</p>
          <p>Price: ${price}</p>
        </div>
        {/* {!isAdmin && userButtons} */}
        {!isAdmin && (
          <AddToCartForm
            handleChange={this.handleChange}
            handleSubmit={this.handleSubmit}
            state={this.state}
            quantity={quantity}
          />
        )}
        {isAdmin && (
          <ProductForm
            handleChange={this.handleChange}
            handleSubmit={this.handleProductUpdate}
            state={this.state}
          />
        )}
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
