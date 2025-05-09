export const authGoogle = (req, res)=>{
    console.log("userLoged: ", req.user)
    const userFormatted = new SendUserDTO(req.user)
    //res.status(200).send({status: "Success", userFound: true, User: userFormatted})
    res.redirect("http://localhost:5173/")
}