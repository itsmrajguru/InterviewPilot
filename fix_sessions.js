const mongoose = require('mongoose');
require('dotenv').config();

const userSchema   = new mongoose.Schema({}, { strict: false });
const sessionSchema = new mongoose.Schema({}, { strict: false });

const User    = mongoose.model('User', userSchema, 'users');
const Session = mongoose.model('InterviewSession', sessionSchema, 'interviewsessions');

async function fix() {
    await mongoose.connect(process.env.MONGO_URI);

    /* find the claude.msrajguru company user we just created */
    const companyUser = await User.findOne({ email: 'claude.msrajguru@gmail.com' });
    if (!companyUser) {
        console.log('Company user not found!');
        process.exit(1);
    }
    console.log('Company user:', companyUser._id, companyUser.email);

    /* check how many sessions still have careersync-service */
    const stale = await Session.find({ companyId: 'careersync-service' }).lean();
    console.log('Sessions with careersync-service companyId:', stale.length);
    stale.forEach(s => console.log('  session:', s._id, 'email:', s.studentEmail, 'status:', s.status));

    /* update all of them to point to the correct company */
    const result = await Session.updateMany(
        { companyId: 'careersync-service' },
        { $set: { companyId: companyUser._id } }
    );
    console.log('Updated sessions:', result.modifiedCount);

    await mongoose.disconnect();
    process.exit(0);
}

fix().catch(e => { console.error(e); process.exit(1); });
