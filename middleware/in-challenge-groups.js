var express = require('express');
var _ = require('lodash')

var Airtable = require("airtable");
const airtableKey = require('../models/airtableAPI')
var base = new Airtable({ apiKey: airtableKey.key}).base(airtableKey.base
);

const challenges = base("Challenges");
module.exports = async (req, res, next)=>{
    
    try{
        // console.log('calling groups', req.userData.email)
        let filter = 'AND(OR(SEARCH("'+req.userData.email+'", {ChallengeAccessList},0) > 0, SEARCH("'+req.userData.email+'", {ChallengeTeam},0) > 0, {ChallengeCreator} = "'+req.userData.email+'", {ChallengeScope} = "Public" ),{ActualVersion} = "yes", {DeletedChallenge} != "*")'

        airtableChallenges = await challenges.select({
            filterByFormula: filter
        }).all()

        myChallenges = airtableChallenges.filter((record)=>{
            // console.log('challenges from airtable ', record.fields.ChallengeTitle)
            if (
            (record['fields'].ActualVersion === 'yes' ||
            record['fields'].ActualVersion == null)&& record['fields'].DeletedChallenge != '*' 
            ) {
              return record;
            } 
        })

        // console.group('challenges received')
        // myChallenges.forEach((challenge)=>{
        // console.log(challenge.fields.ChallengeTitle, challenge.fields.ActualVersion, challenge.fields.DeletedChallenge, challenge.fields.ChallengeBusiness)
        // })
        // console.groupEnd()
        
        filterChallenges = Object.keys(_.groupBy(myChallenges, function(challenge){
            return challenge.fields.ChallengeTitle
        }))
        // console.log(filterChallenges)
        
        myCustomGroups = Object.keys(_.groupBy(myChallenges, function(category){
            return category.fields.ChallengeGroup
        }))

        let customGroup = []
         myCustomGroups.forEach((group)=>{
            //  console.log('custom group ', group)
             if(group == 'undefined'){
             customGroup.push({
                 groupName: 'Por definir',
                 groupCategory: 'Mis grupos',
                 groupType: 'Plataforma',
                 categoryOrder: 5
             })} else {
                 customGroup.push({
                 groupName: group,
                 groupCategory: 'Mis grupos',
                 groupType: 'Plataforma',
                 categoryOrder: 5
             })
             }
         })
        // console.log('challenges groups ', myChGroups)

        myChBusiness = Object.keys((_.groupBy(myChallenges, function(category){
        return category.fields.ChallengeBusiness
         })))

         let groupBusiness = []
         myChBusiness.forEach((group)=>{
             if(group == 'undefined'){
                 groupBusiness.push({
                 groupName: 'Por definir',
                 groupCategory: 'Negocio',
                 groupType: 'Plataforma',
                 categoryOrder: 1
             })} else {
                 groupBusiness.push({
                 groupName: group,
                 groupCategory: 'Negocio',
                 groupType: 'Plataforma',
                 categoryOrder: 1
                })
                }
        })


        myChType = Object.keys((_.groupBy(myChallenges, function(category){
        return category.fields.ChallengeType
         })))
                  
         let groupType = []
         myChType.forEach((group)=>{
             if(group == 'undefined'){
             groupType.push({
                 groupName: 'Por definir',
                 groupCategory: 'Cuadrante',
                 groupType: 'Plataforma',
                 categoryOrder: 2
             })
             } else {
                 groupType.push({
                 groupName: group,
                 groupCategory: 'Cuadrante',
                 groupType: 'Plataforma',
                 categoryOrder: 2
             })
             }
         })
        
         myChStage = Object.keys((_.groupBy(myChallenges, function(category){
        return category.fields.ChallengeStage
         })))
         
         let groupStage = []
         myChStage.forEach((group)=>{
             if(group == 'undefined'){
             groupStage.push({
                 groupName: 'Por definir',
                 groupCategory: 'Madurez',
                 groupType: 'Plataforma',
                 categoryOrder: 3
             })} else{
                 groupStage.push({
                 groupName: group,
                 groupCategory: 'Madurez',
                 groupType: 'Plataforma',
                 categoryOrder: 3
             })
             }
         })

         myChBudget = Object.keys((_.groupBy(myChallenges, function(category){
        return category.fields.ChallengeBudgetRange
         })))

         let groupBudget = []
         myChBudget.forEach((group)=>{
             if(group == 'undefined'){
             groupBudget.push({
                 groupName: 'Por definir',
                 groupCategory: 'Presupuesto',
                 groupType: 'Plataforma',
                 categoryOrder: 4
             })} else {
                 groupBudget.push({
                 groupName: group,
                 groupCategory: 'Presupuesto',
                 groupType: 'Plataforma',
                 categoryOrder: 4
             
         })}
        })

         allChGroups = [...groupBudget, ...groupBusiness, ...groupStage, ...groupType, ...customGroup]

         finalGroups = _.groupBy(allChGroups, function(group){
             return group.groupCategory
         })

            var inGroups = [];
            for( var property in finalGroups) {
            var obj = {};
            obj[property] = finalGroups[property];
            inGroups.push( obj ); 
            }

        //  console.log('all groups ', allChGroups)

         res.locals.inGroups = {
             inGroups: inGroups,
             filters: filterChallenges
            }
        

        next(); 

    } catch (error) { 
        res.status(422).json({
            message: 'inChallengeGroups failed!'
        });
    }
}