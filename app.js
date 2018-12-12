var express          = require("express"),
    bodyParser       = require("body-parser"),
    expressSanitizer = require("express-sanitizer"),
    mongoose         = require("mongoose"),
    methodOverride   = require("method-override"),
    app              = express();

mongoose.connect('mongodb://localhost/restful_blog_app', { useNewUrlParser: true });
mongoose.set("useFindAndModify", false);
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(expressSanitizer());
app.use(express.static("public"));
app.use(methodOverride("_method"));

var blogSchema = new mongoose.Schema({
    title : String,
    image : String,
    body : String,
    created : {type : Date, default : Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);

app.get("/", (req, res) => {
    res.redirect("/blogs");
});

app.get("/blogs", (req, res) => {
    Blog.find({}, (err, blogs) => {
        if(err) {
            console.log("Error");
        }
        else {
            res.render("index", {blogs : blogs});
        }
    });
});

app.get("/blogs/new", (req, res) => {
    res.render("new");
});

app.post("/blogs", (req, res) => {
    req.body.blog.body =  req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, (err, newBlog) => {
        if(err) {
            res.render("new");
        }
        else {
            res.redirect("/blogs");
        }
    });
});

app.get("/blogs/:id", (req, res) => {
    Blog.findById(req.params.id, (err,foundBlog) => {
        if(err) {
            res.redirect("/blogs");
        }
        else {
            res.render('show', {blog : foundBlog});
        }
    });
});

app.get("/blogs/:id/edit", (req, res) => {
    Blog.findById(req.params.id, (err,foundBlog) => {
        if(err) {
            res.redirect("/blogs");
        }
        else {
            res.render('edit', {blog : foundBlog});
        }
    });
});

app.put("/blogs/:id", (req, res) => {
    req.body.blog.body =  req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
        if (err) {
            res.redirect("/blogs");
        }
        else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

app.delete("/blogs/:id", (req, res) => {
    Blog.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
            res.redirect("/blogs");
        }
        else {
            res.redirect("/blogs");
        }
    });
});

app.listen(3000, "localhost", () => console.log("Server is Running"));