const signIn = (req, res, next) => {
    const getVehicleTypeList = async (req, res) => {
        try {
            res.json({
                status: 'success',
                messagg: 'Sign in router are working'
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Internal Server Error" })
        }
    }
}

module.exports = signIn
