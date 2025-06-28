import PharmacyModel from "../../DB/models/pharmacy.model.js";
import productModel from "../../DB/models/product.model.js";
import userModel from "../../DB/models/user.model.js";
import cloudinary from "../../utilities/cloudnairy/index.js";
import { asyncHandler } from "../../utilities/globalErrorHandling.js";
import CryptoJS from "crypto-js";
import { decrypt } from "../../utilities/security/decrypt.js";

export const searchPharmacies = asyncHandler(async (req, res, next) => {
  const userId = req.user?.id;

  if (!userId) {
    return next(new Error("Authentication required"));
  }

  try {
    const {
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
      city,
      medicine
    } = req.query;

    const query = { isApproved: true };

    // 🔍 Optional search by location string or user name (after population)
    if (search) {
      query.location = { $regex: search, $options: "i" };
    }

    // 🏙️ Filter by city in the location string
    if (city) {
      query.location = { $regex: city, $options: "i" };
    }

    // 💊 Filter by available medicine
    if (medicine) {
      const pharmacyIds = await productModel
        .find({ name: { $regex: medicine, $options: "i" } })
        .distinct("pharmacyId");

      query._id = { $in: pharmacyIds };
    }

    let pharmacies = await PharmacyModel
      .find(query)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .populate("userId", "name  phoneNumber profileImage");

    // If `search` includes user name, filter manually after population
    if (search) {
      pharmacies = pharmacies.filter(p =>
        p.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.location?.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.status(200).json({
      success: true,
      data: {
        pharmacies,
        filters: {
          ...(search && { search }),
          ...(city && { city }),
          ...(medicine && { medicine }),
        },
      },
    });
  } catch (err) {
    console.error("Pharmacy search error:", err);
    return next(new Error("Failed to fetch pharmacies"));
  }
});

//-----------------------------------------------------------------getPharmacyAccountByUser--------------------------------------------------------------------
  export const getPharmacyAccount = asyncHandler(async (req, res, next) => {
    const {pharmacyId} = req.params;
    const pharmacy = await PharmacyModel.findOne({userId:pharmacyId}).select("location").populate({
     path: "userId",
     select: "name  phoneNumber profileImage"}
    );
  
    if (!pharmacy) {
      return next(new Error("Pharmacy not found"));
    }
    const decryptedPhone = decrypt(pharmacy.userId.phoneNumber, process.env.SECRETE_KEY);
    pharmacy.userId.phoneNumber = decryptedPhone;
    const products = await productModel.find({ pharmacyId: pharmacy.userId }).select("title price image type "); 
  
    res.status(200).json({
      success: true,
      data:{ pharmacy, products },
    });
  });
//-----------------------------------------------------------------getPharmacyHomebypharmacy--------------------------------------------------------------------
  export const getPharmacyHome = asyncHandler(async (req, res, next) => {
    
    const pharmacy = await PharmacyModel.findOne({userId:req.user._id})
     
    if (!pharmacy) {
      return next(new Error("Pharmacy not found"));
    }
    console.log(req.user._id)  
    const products = await productModel.find({ pharmacyId: req.user._id }).select("title price image type ").sort({ createdAt: -1 }); 
    console.log(products.pharmacyId)
  if(products.length==0){
    return next(new Error("No products found"));
  }
    res.status(200).json({
      success: true,
        products ,
    });
  });
  //-----------------------------------------------------------------getPharmacyProfilebypharmacy--------------------------------------------------------------------
  export const getPharmacyProfile = asyncHandler(async (req, res, next) => {
    
  const pharmacy = await PharmacyModel.findOne({ userId: req.user._id })
    .select("location")
    .populate({
      path: "userId",
      select: "name phoneNumber profileImage"
    });

  if (!pharmacy) {
    return next(new Error("Pharmacy not found"));
  }
 try {
    const decryptedPhone = decrypt(req.user.phoneNumber, process.env.SECRETE_KEY);
    pharmacy.userId.phoneNumber = decryptedPhone;
  } catch (error) {
    console.error("Decryption error:", error.message);
    pharmacy.userId.phoneNumber = "";
  }
  res.status(200).json({
    success: true,
    data: { pharmacy },
  });
});
 
  
  export const getAllPharmacies = asyncHandler(async (req, res, next) => {
    const pharmacies = await PharmacyModel.find().select("location").populate({
      path:"userId",
     select: "name   "}
    )
    pharmacies.sort((a, b) => {
    const nameA = a.userId?.name?.toLowerCase() || "";
    const nameB = b.userId?.name?.toLowerCase() || "";
    return nameA.localeCompare(nameB);
  })
  
    res.status(200).json({
      success: true,
      data: pharmacies,
    });
  }); 
  
  export const uploadProfile = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new Error("No file uploaded"));
  }

  const currentUser = await userModel.findById(req.user._id);

  // Delete the old image if it is not the default
  if (currentUser.profileImage?.public_id && currentUser.profileImage.public_id !== "default-image") {
    await cloudinary.uploader.destroy(currentUser.profileImage.public_id);
  }

  // Upload the new image
  const profile = await cloudinary.uploader.upload(req.file.path, {
    folder: 'pharmacies',
  });

  // Update user's profile image
  const updatedUser = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      profileImage: {
        secure_url: profile.secure_url,
        public_id: profile.public_id,
      },
    },
    { new: true, lean: true }
  );

  res.status(201).json({ msg: "Profile picture updated", user: updatedUser });
});



