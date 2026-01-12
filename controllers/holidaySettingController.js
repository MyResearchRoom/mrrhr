const { HolidaySetting } = require('../models')

exports.addHolidaySetting = async (req, res) => {
    try {
        const { holidayName, date, description } = req.body;

        if (!holidayName || !date) {
            return res.status(400).json({
                success: false,
                message: 'Please fill the required fields'
            })
        }

        const holidaySetting = await HolidaySetting.create({
            holidayName,
            date,
            description
        });

        res.status(200).json({
            success: true,
            message: 'Holiday setting added successfully!',
            data: holidaySetting
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to add holiday setting'
        })
    }
}

exports.getHolidaySettingList = async (req, res) => {
    try {

        const holidaySetting = await HolidaySetting.findAll()
        const formattedHolidays = holidaySetting.map(h => ({
            ...h.toJSON(),
            date: new Date(h.date).toLocaleDateString('en-IN'), 
        }));
        res.status(200).json({
            success: true,
            message: 'Holiday setting list retrieved successfully',
            data: formattedHolidays
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve holiday setting list'
        });
    }
}

exports.editHolidaySetting = async (req, res) => {
    try {
        const { id } = req.params;
        const { holidayName, date, description } = req.body;

        const holidaySetting = await HolidaySetting.findByPk(id);

        if (!holidaySetting) {
            return res.status(404).json({
                success: false,
                message: 'Holiday setting not found'
            });
        }
        await holidaySetting.update({
            holidayName: holidayName || holidaySetting.holidayName,
            date: date || holidaySetting.date,
            description: description || holidaySetting.description
        });
        res.status(200).json({
            success: true,
            message: 'Holiday setting updated successfully',
            data: holidaySetting
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to update holiday setting'
        })
    }
}

exports.deleteHolidaySetting = async (req, res) => {
    try {
        const { id } = req.params;

        const holidaySetting = await HolidaySetting.findByPk(id);

        if (!holidaySetting) {
            return res.status(404).json({
                success: false,
                message: 'Holiday setting not found'
            });
        }

        await holidaySetting.destroy();
        return res.status(200).json({
            success: true,
            message: 'Holiday setting deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete holiday setting'
        });
    }
}