const router=require('express').Router();
const foodController=require('../controllers/foodController')
router.post("/",foodController.addFood)
router.get("/:id",foodController.getFoodById)
router.get("/search/:search",foodController.searchFoods)
router.get("/:category/:code",foodController.getFoodsByCategoryAndCode)
router.get("/recommendation:code",foodController.getRandomFood)
router.get("/random/:code",foodController.getRandomFood)
router.get("/restaurant-foods/:id",foodController.getFoodsByRestaurant)




module.exports=router