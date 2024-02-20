const { Property, Owner, Issue } = require('../models');
const { BadRequestError, InternalServerError } = require('../utils/errors');
const { findOwners } = require('../utils/db-queries/owner');
// const { } = require('../utils/db-queries/property');

async function renderProperties(req, res) {
  const properties = await getAllProperties();
  res.status(200).render('property-main', { properties });
};

async function renderOneProperty(req, res) {
  const { id: property_id } = req.params;
  const properties = await getPropertyByID(property_id);

  if (req.headers['hx-request']) {
    res.status(200).render('property-id', { properties, layout: false });
  } else {
    res.status(200).render('property-id', { properties });
  }
};

async function renderSelectOwners(req, res) {
  const owners = await findOwners();

  if (req.headers['hx-request']) {
    res.status(200).render('property-owners', { owners, layout: false });
  } else {
    res.status(200).redirect('/properties');
  }
};

async function renderNewForm(req, res) {
  const owners = await findOwners();

  if (req.headers['hx-request']) {
    res.status(200).render('property-new', { owners, layout: false });
  } else {
    res.status(200).redirect('/properties');
  }
};

async function getAllProperties() {
  const propertyData = await Property.findAll({
    include: [
      { model: Owner },
    ],
    raw: true,
    nest: true
  });

  if (!propertyData) {
    throw new BadRequestError('Something went wrong');
  }
  console.log(propertyData);
  return propertyData;
};

async function getPropertyByID(id) {
  const propertyData = Property.findByPk(id, {
    include: [
      { model: Owner },
      { model: Issue,
        attributes: { exclude: ['createdAt', 'updatedAt']}
      }
    ],
    raw: true,
    nest:true
  });

  if (!propertyData) {
    throw new BadRequestError('Something went wrong');
  }

  return propertyData;
};

async function createProperty(req, res) {
  const { property_name, property_street, property_city, property_state, property_zip, owner_id } = req.body;
  // for owner_id, in front end, we need to present user with a list of potential owners to associate
  // with this property, then transfer the id of the selected owner into here
  // this means that before someone can add a new property, they have to first add the new Owner so...
  if (!owner_id) {
    throw new BadRequestError("You must select an existing property owner.");
  };

  if (!(property_name && property_street && property_city && property_state && property_zip && owner_id)) {
    throw new BadRequestError("Missing Data - Please complete all fields");
  }

  const newProperty = await Property.create({
    property_name,
    property_street,
    property_city,
    property_state,
    property_zip,
    owner_id
  });

  if (!newProperty) {
    throw new InternalServerError("New Property creation failed.");
  } else {
    res.status(200).json({ msg: "New Property succesfully created!" });
  };
};

async function updateProperty(req, res) {
  const property_id = req.params.id;
  const { property_name, property_street, property_city, property_state, property_zip, owner_id } = req.body;

  const propData = await Property.update({
    property_name,
    property_street,
    property_city,
    property_state,
    property_zip,
    owner_id}, {
      where: {
        property_id
      },
    });

    if (propData[0] === 0) {
      throw new BadRequestError("Update property failed");
    } else {
      res.status(200).json({ msg: `Update property ID: ${property_id} succeeded`});
    }
};

async function deleteProperty(req, res) {
  const property_id = req.params.id;

  const propDelData = await Property.destroy({
    where: {
      property_id
    }
  });

  if (!propDelData) {
    throw new BadRequestError("Delete property failed");
  } else {
    res.status(200).json({ msg: `Delete property ID: ${property_id} succeeded`});
  }
};

// is this the correct export for all controller files?
module.exports = {
  renderProperties,
  renderOneProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  renderSelectOwners,
  renderNewForm,

};