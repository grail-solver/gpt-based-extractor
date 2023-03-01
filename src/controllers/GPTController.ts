import {Request, NextFunction, Response} from "express";
import { check, validationResult } from 'express-validator';
const { Configuration, OpenAIApi } = require("openai");
const xml2js = require('xml2js');

export default class GPTController {
    // attribute
    private openai: any;
    private readonly model: string;
    private variable_struct: any;
    private constraint_struct: any;
    private problem: string;

    // constructor
    constructor(api_key: string, model: string = "text-davinci-003", variable_struct: string = null, constraint_struct: string = null) {
        this.model = model;
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY||api_key,
        });
        this.openai = new OpenAIApi(configuration);

        if(variable_struct != null) {
            this.variable_struct = variable_struct;
        }
        else{
            this.variable_struct = "<variable>\n" +
                "  <id>integer</id>\n" +
                "  <name>string</name>\n" +
                "  <type>Integer,Enum,Float</type>\n" +
                "  <domaine_type>INTERVAL,SET_OF_DISCRET_VALUES</domaine_type>\n" +
                "  <domaine_values>[integer]</domaine_values>\n" +
                "</variable>";
        }

        if(constraint_struct != null) {
            this.constraint_struct = constraint_struct;
        }
        else{
            this.constraint_struct = "like equation separated '@equ' . Ex: 2(Var_1) + 3(Var_2) <= 100. In this example we concat Var_ with variable id."
        }
    }

    // methods
    private extractData = async (problem: string) => {
        const response = await this.openai.createCompletion({
            model: this.model,
                prompt: `Analyzes this constraint satisfaction problem, then extracts the variables and constraints: '${problem}'. The variables must be encoded on this way: '${this.variable_struct} and the contraints on this way ${this.constraint_struct}.'`,
            temperature: 0.7,
            max_tokens: 1000,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });
        return response.data.choices[0].text.trim();
    }

    private badCharacterParser (xmlString: string) {
        let xml = xmlString.replace("Variables:", "");
        xml = xml.trim();
        let xml_array = xml.split('Constraints:');
        for(let i=0; i<xml_array.length; i++) {
            xml_array[i] = xml_array[i].trim();
        }
        return xml_array;
    }

    private xmlToJson(xmlString: string, root:string) : any {
        let json = "";
        console.log(`<${root}>${xmlString}</${root}>`)
        xml2js.parseString(`<${root}>${xmlString}</${root}>`, (err: any, result: any) => {
            if (err) {
                console.error(err);
            }
            else {
                json = JSON.stringify(result);
                console.log(json);
            }
        });
        return JSON.parse(json).variables.variable;
    }

    private buildConstraint (str: string) {
        // utils
        const metric = ['!=', '=', '<','<=', '>', '>='];
        const operator = ['+', '-', '*','/', '%'];
        let equations = [];

        // first parsing
        let equations_str = str.split('@equ')
        equations_str = equations_str.filter(str => str !== '');

        // second parsing
        for(let equ_i = 0; equ_i<equations_str.length; equ_i ++) {
            let equ_str = equations_str[equ_i];

            const arr = equ_str.trim().split(' ');
            let currentChunk = []
            for (let i = 0; i < arr.length; i++) {
                const token = arr[i];
                const var_match_coef = token.match(/^(\d+)\((.+)\)$/);
                const var_match_sing = token.match(/^Var_(\d+)$/);
                if (var_match_coef) {
                    currentChunk.push([Number(var_match_coef[1]), var_match_coef[2]]);
                }
                else if(var_match_sing) {
                    currentChunk.push([Number(1), token]);
                }
                else {
                    currentChunk.push(token);
                }
            }

            // turn to obj
            const metricIndex = currentChunk.findIndex((element) => {
                // @ts-ignore
                return metric.includes(element);
            });
            let obj = {
                'left_part': currentChunk.slice(0, metricIndex),
                'metric': currentChunk[metricIndex],
                'right_part': currentChunk.slice(metricIndex+1)
            };
            equations.push(obj);
        }
        return equations;
    }

    public api = [
        check('text').isLength({ min: 3 }).withMessage('CP Problem text is required'),
        async (req: Request, res: Response, next: NextFunction) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    status: 'fail',
                    errors: errors.array()
                });
            }

            try {
                // Get plain variable and convert to object
                let plain_data  = await this.extractData(req.body.text);
                let first_clean = this.badCharacterParser(plain_data);
                let variables   = this.xmlToJson(first_clean[0], 'variables');
                let constraint  = this.buildConstraint(first_clean[1]);

                return res.status(200).json({
                    status: 'success',
                    data: {
                        // plain_data,
                        variables,
                        constraint
                    }
                })
            }
            catch (error) {
                return res.status(401).json({
                    status: 'fail',
                    errors: [error.stack]
                });
            }
        }
    ];
}
