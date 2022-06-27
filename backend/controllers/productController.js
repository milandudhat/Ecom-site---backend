const Product = require('../models/Productmodel')
const ErrorHander = require('../utils/errorhander')
const catchAsyncError = require('../middleware/catchAsyncError')
const ApiFeatures = require('../utils/apifeature')


// create Product --- admin
exports.createProduct = catchAsyncError(async (req, res, next) => {

    req.body.user = req.user.id
    const product = await Product.create(req.body)

    res.status(201).json({
        success: true,
        product
    })
})


//  get all product
exports.getAllProducts = catchAsyncError(async (req, res, next) => {
    const resultPerPage = 8;
    const productCount = await Product.countDocuments();




    const apiFeatures = new ApiFeatures(Product.find(), req.query)
        .search()
        .filter().pagination(resultPerPage)
    const products = await apiFeatures.query;
    res.status(200).json({
        success: true,
        products,
        productCount
    })

})


// get product Details 
exports.getProductDetails = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.params.id);


    if (!product) {
        return next(new ErrorHander("Product Not Found", 404))
    }

    await product.remove()
    res.status(200).json({
        success: true,
        product
    })

})


// update product --- admin 
exports.updateProduct = catchAsyncError(async (req, res, next) => {
    let product = await Product.findById(req.params.id);


    if (!product) {
        return next(new ErrorHander("Product Not Found", 404))
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    res.status(200).json({
        success: true,
        product
    })

})


// delete product --- admin 
exports.deleteProduct = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.params.id);


    if (!product) {
        return next(new ErrorHander("Product Not Found", 404))
    }

    await product.remove()
    res.status(200).json({
        success: true,
        message: "Product delete success"
    })

})


// create new Review Or Update Review
exports.createProductReview = catchAsyncError(async (req, res, next) => {

    const { rating, coment, productId } = req.body
    const review = {
        user: req.user._id,
        rating: Number(rating),
        coment: coment,
    }



    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find((rev) => rev.user.toString() === req.user._id)
    if (isReviewed) {

        product.reviews.forEach(element => {
            if (element.user.toString() === element.user._id.toString())
                (element.rating = rating), (element.comment = comment);
        });
    }
    else {
        product.reviews.push(review)
        product.numOfReviews = product.reviews.length;
    }

    let a = 0;

    product.reviews.forEach((e) => {
        a += e.rating;
    });

    product.ratings = a / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
    });
})

// Get All Reviews of a product
exports.getProductReviews = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    if (!product) {
        return next(new ErrorHander("Product not found", 404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    });
});


// Delete Review
exports.deleteReview = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);

    if (!product) {
        return next(new ErrorHander("Product not found", 404));
    }

    const reviews = product.reviews.filter(
        (e) => e._id.toString() !== req.query.id.toString()
    );

    let a = 0;

    reviews.forEach((e) => {
        a += e.rating;
    });

    let ratings = 0;

    if (reviews.length === 0) {
        ratings = 0;
    } else {
        ratings = a / reviews.length;
    }

    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(
        req.query.productId,
        {
            reviews,
            ratings,
            numOfReviews,
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );

    res.status(200).json({
        success: true,
    });
});