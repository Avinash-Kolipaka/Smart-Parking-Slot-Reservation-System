const Tenant = require('../../models/Tenant');
const TenantMembership = require('../../models/TenantMembership');
const Subscription = require('../../models/Subscription');

const createTenant = async (userId, tenantData) => {
  const session = await Tenant.startSession();
  session.startTransaction();

  try {
    const tenant = await Tenant.create([tenantData], { session });

    await TenantMembership.create([{
      userId,
      tenantId: tenant[0]._id,
      role: 'TENANT_OWNER',
      status: 'ACTIVE'
    }], { session });

    await Subscription.create([{
      tenantId: tenant[0]._id,
      plan: 'FREE',
      status: 'TRIALING'
    }], { session });

    await session.commitTransaction();
    return tenant[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getUserTenants = async (userId) => {
  return await TenantMembership.find({ userId, status: 'ACTIVE' })
    .populate('tenantId');
};

module.exports = {
  createTenant,
  getUserTenants
};
