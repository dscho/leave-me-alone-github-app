module.exports = (fn, fallback) => {
    try {
        return fn()
    } catch (e) {
        return fallback
    }
}
