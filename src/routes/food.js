const router=require('express').Router();
const foodController=require('../controllers/foodController')
const {verifyVendor}=require("../middleware/verifyToken")
router.post("/",foodController.addFood)
router.get("/:category/:code",foodController.getFoodsByCategoryAndCode)

router.get("/byCode/:code",foodController.getAllFoodsByCode)
router.get("/search/:search",foodController.searchFoods)


router.get("/",foodController.getRandomFood)
router.get("/restaurant/foods/:id",foodController.getFoodsByRestaurant)
router.get("/:id",foodController.getFoodById)



module.exports=router