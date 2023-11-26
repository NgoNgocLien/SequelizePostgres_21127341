const controller = {};
const { create } = require('express-handlebars');
const models = require('../models');

controller.showList = async (req, res) => {
    let blogs;
    let pageNumber = [];

    let id = req.query.page;
    let page = isNaN(id) ? 1 : parseInt(id);

    let tagId = req.query.tagid || null;
    let tags = await models.Tag.findAll({
        attributes: ['id', 'name']
    });

    let categoryId = req.query.categoryid || null;
    let categories = await models.Category.findAll({
        attributes: ['id', 'name', [models.sequelize.literal('(SELECT COUNT(*) FROM "Blogs" WHERE "Blogs"."categoryId" = "Category"."id")'), 'blogCount']],
        raw: true, // Use raw: true to get plain JSON objects instead of Sequelize instances
    });

    let search = req.query.search || null;
    if (search != null) {
        // let totalPage = Math.ceil(await models.Blog.count({ where: { title: { [models.Sequelize.Op.like]: '%' + search + '%' } } }) / 2);
        let totalPage = Math.ceil(await models.Blog.count({ where: { title: { [models.Sequelize.Op.like]: '%' + search + '%' } } }) / 2);
        if (page < 1 || totalPage == 0 ) page = 1
        else if (page > totalPage && totalPage > 0) page = totalPage;

        for (let i = 1; i <= totalPage; i++) {
            pageNumber.push(i);
        }
        let offset = (page - 1) * 2;

        blogs = await models.Blog.findAll({
            attributes: ['id', 'title', 'imagePath', 'summary', 'createdAt'],
            where: { title: { [models.Sequelize.Op.like]: '%' + search + '%' } },
            include: [{ 
                model: models.Comment
            }], 
            limit: 2,
            offset: offset
        });
    } else {
        if (tagId == null && categoryId == null) {
            let totalPage = Math.ceil(await models.Blog.count() / 2);
            if (page < 1 || totalPage == 0) page = 1
            else if (page > totalPage) page = totalPage;
    
            for (let i = 1; i <= totalPage; i++) {
                pageNumber.push(i);
            }
            let offset = (page - 1) * 2;
    
            blogs = await models.Blog.findAll({
                attributes: ['id', 'title', 'imagePath', 'summary', 'createdAt'],
                include: [{ 
                    model: models.Comment
                }], 
                limit: 2,
                offset: offset
            });
        } else if (tagId != null && categoryId == null) {
            let totalPage = Math.ceil(await models.Blog.count({ include: [{ model: models.Tag, where: { id: tagId } }] }) / 2);
            if (totalPage == 0) totalPage = 1;
            if (page < 1 || totalPage == 0) page = 1
            else if (page > totalPage) page = totalPage;
    
            for (let i = 1; i <= totalPage; i++) {
                pageNumber.push(i);
            }
            let offset = (page - 1) * 2;
    
            blogs = await models.Blog.findAll({
                attributes: ['id', 'title', 'imagePath', 'summary', 'createdAt'],
                include: [{ 
                    model: models.Comment
                }, { 
                    model: models.Tag, 
                    where: { id: tagId }
                }], 
                limit: 2,
                offset: offset
            });
        } else if (tagId == null && categoryId != null) {
            let totalPage = Math.ceil(await models.Blog.count({ where: { categoryId: categoryId } }) / 2);
            if (page < 1 || totalPage == 0) page = 1
            else if (page > totalPage) page = totalPage;
    
            for (let i = 1; i <= totalPage; i++) {
                pageNumber.push(i);
            }
            let offset = (page - 1) * 2;
    
            blogs = await models.Blog.findAll({
                attributes: ['id', 'title', 'imagePath', 'summary', 'createdAt'],
                where: { categoryId: categoryId },
                include: [{ 
                    model: models.Comment
                }], 
                limit: 2,
                offset: offset
            });
        } else {    
            let totalPage = Math.ceil(await models.Blog.count({ where: { categoryId: categoryId }, include: [{ model: models.Tag, where: { id: tagId } }] }) / 2);
            if (page < 1 || totalPage == 0) page = 1
            else if (page > totalPage) page = totalPage;
    
            for (let i = 1; i <= totalPage; i++) {
                pageNumber.push(i);
            }
            let offset = (page - 1) * 2;
    
            blogs = await models.Blog.findAll({
                attributes: ['id', 'title', 'imagePath', 'summary', 'createdAt'],
                where: { categoryId: categoryId },
                include: [{ 
                    model: models.Comment
                },
                { 
                    model: models.Tag, 
                    where: { id: tagId }
                }], 
                limit: 2,
                offset: offset
            });
        }
    }

    res.render('index', { blogs: blogs, tags: tags, categories: categories, search: search, pageNumber: pageNumber, nextPage: page + 1, previousPage: page - 1, tagId: tagId, categoryId: categoryId });
}
   
controller.showDetails = async(req, res) => {
    let tags = await models.Tag.findAll({
        attributes: ['id', 'name']
    });
    let categories = await models.Category.findAll({
        attributes: ['id', 'name', [models.sequelize.literal('(SELECT COUNT(*) FROM "Blogs" WHERE "Blogs"."categoryId" = "Category"."id")'), 'blogCount']],
        raw: true, // Use raw: true to get plain JSON objects instead of Sequelize instances
    });

    let id = isNaN(req.params.id) ? 0 : parseInt(req.params.id);
    res.locals.blog = await models.Blog.findOne({
        attributes: ['id', 'title', 'description', 'createdAt'],
        where: { id: id },
        include: [
            { model: models.Category },
            { model: models.User },
            { model: models.Tag },
            { model: models.Comment }
        ]
    })
    res.render('details', { tags: tags, categories: categories });
}

module.exports = controller;