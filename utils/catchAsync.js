// In order to get rid of try catch 
module.exports = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
