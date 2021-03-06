const Galleries = require('./model');

exports.replacePhoto = (req, res) => {
	Galleries.updateOne({ _id: req.params.galleryID, "photos": req.body.removeImageURL }, 
										   { $set: { "photos.$": req.body.imageURL } }).then((gallery) => {
		if (!gallery) {
			return res.status(404).json({ 'Error': 'error', 'image': null });
		} else {
			return res.status(201).json({ 'image': req.body.imageURL, 'imageRemoved': req.body.removeImageURL });
		}
	});
};

exports.addPhoto = (req, res) => {
	Galleries.findOneAndUpdate({ _id: req.params.galleryID }, { $push: { photos: req.body.imageURL } }).then((gallery) => {
		if (!gallery) {
			return res.status(404).json({ 'Error': 'error', 'image': null });
		} else {
			return res.status(201).json({ 'image': req.body.imageURL });
		}
	});
};