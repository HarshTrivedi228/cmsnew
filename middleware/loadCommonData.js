const SettingModel =require( '../models/setting');

const loadCommonData=async(req,res,next)=>{
  try{
    const settings=await SettingModel.findOne();
    res.locals.settings=settings;
    next();
  }catch(err){
    console.error('Error loading common data:',err);
    next(err);
  }
}

module.exports=loadCommonData